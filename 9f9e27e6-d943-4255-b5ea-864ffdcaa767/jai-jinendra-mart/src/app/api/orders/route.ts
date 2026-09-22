import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      landmark,
      pincode,
      delivery_note,
      contact_language = 'en',
      items,
      coupon_code,
      payment_method = 'cod',
    } = body;

    // 1. Validation
    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const cleanPhone = (customer_phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'A valid 10-digit Indian mobile number is required' },
        { status: 400 }
      );
    }

    if (!delivery_address || !delivery_address.trim()) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 });
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: 'A valid 6-digit PIN code is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const db = getDatabase();

    // 2. Fetch product records from DB and verify stock & calculate server-side totals
    let subtotal = 0;
    let totalTax = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const prodId = item.product_id || item.product?.id;
      const qty = parseInt(item.quantity, 10);

      if (!prodId || isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: 'Invalid item in cart' }, { status: 400 });
      }

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId) as any;
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${prodId}` }, { status: 404 });
      }

      if (product.stock_quantity < qty) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name_en}". Only ${product.stock_quantity} available.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.selling_price * qty;
      const itemTax = (itemTotal * (product.gst_rate || 0)) / 100;

      subtotal += itemTotal;
      totalTax += itemTax;

      validatedItems.push({
        product,
        quantity: qty,
        unit_price: product.selling_price,
        total_price: itemTotal,
        gst_rate: product.gst_rate || 0,
        hsn_code: product.hsn_code || '0000',
      });
    }

    // 3. Coupon Discount Calculation (Server-Side)
    let discount = 0;
    let appliedCouponCode = null;
    if (coupon_code) {
      const coupon = db
        .prepare('SELECT * FROM coupons WHERE code = ? AND active = 1')
        .get(coupon_code.toUpperCase()) as any;

      if (coupon && subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          const disc = (subtotal * coupon.discount_value) / 100;
          discount = coupon.max_discount ? Math.min(disc, coupon.max_discount) : disc;
        } else {
          discount = Math.min(coupon.discount_value, subtotal);
        }
        appliedCouponCode = coupon.code;

        // Increment coupon used count
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
      }
    }

    // 4. Delivery fee calculation
    const FREE_THRESHOLD = 499;
    const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : 30;

    // 5. Total
    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 6. Generate unique Order ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `JJM-${dateStr}-${randomSuffix}`;
    const orderId = 'ord-' + Date.now();
    const now = new Date().toISOString();

    // 7. Atomic Execution
    db.exec('BEGIN TRANSACTION;');

    try {
      // Insert Order
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          id, order_number, customer_name, customer_phone, customer_email,
          delivery_address, landmark, pincode, delivery_note, contact_language,
          subtotal, discount, coupon_code, delivery_fee, tax, total,
          payment_method, payment_status, order_status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const initialPaymentStatus = payment_method === 'demo_upi' ? 'completed' : 'pending';

      insertOrder.run(
        orderId,
        orderNumber,
        customer_name.trim(),
        cleanPhone,
        customer_email ? customer_email.trim() : null,
        delivery_address.trim(),
        landmark ? landmark.trim() : null,
        pincode.trim(),
        delivery_note ? delivery_note.trim() : null,
        contact_language,
        subtotal,
        discount,
        appliedCouponCode,
        deliveryFee,
        Math.round(totalTax * 100) / 100,
        Math.round(total * 100) / 100,
        payment_method,
        initialPaymentStatus,
        'received',
        null,
        now,
        now
      );

      // Insert Order Items and Decrement Product Stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name_en, product_name_hi, unit,
          quantity, unit_price, total_price, gst_rate, hsn_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity - ?, updated_at = ?
        WHERE id = ?
      `);

      for (let i = 0; i < validatedItems.length; i++) {
        const vi = validatedItems[i];
        const itemId = `item-${orderId}-${i + 1}`;
        insertItem.run(
          itemId,
          orderId,
          vi.product.id,
          vi.product.name_en,
          vi.product.name_hi,
          vi.product.unit,
          vi.quantity,
          vi.unit_price,
          vi.total_price,
          vi.gst_rate,
          vi.hsn_code
        );

        updateStock.run(vi.quantity, now, vi.product.id);
      }

      // Record Payment
      const paymentId = 'pay-' + Date.now();
      const insertPayment = db.prepare(`
        INSERT INTO payments (
          id, order_id, payment_method, payment_status, transaction_id, amount, currency, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const txId =
        payment_method === 'demo_upi'
          ? `UPI-DEMO-${Date.now().toString(36).toUpperCase()}`
          : `COD-PENDING-${orderNumber}`;

      insertPayment.run(
        paymentId,
        orderId,
        payment_method,
        initialPaymentStatus,
        txId,
        total,
        'INR',
        JSON.stringify({ method: payment_method, is_demo: payment_method === 'demo_upi' }),
        now
      );

      // Upsert Customer record
      const existingCustomer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(cleanPhone) as any;
      if (existingCustomer) {
        db.prepare(`
          UPDATE customers
          SET total_orders = total_orders + 1,
              total_spent = total_spent + ?,
              name = ?,
              updated_at = ?
          WHERE id = ?
        `).run(total, customer_name.trim(), now, existingCustomer.id);
      } else {
        const custId = 'cust-' + Date.now();
        db.prepare(`
          INSERT INTO customers (id, name, phone, email, addresses_json, total_orders, total_spent, active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, 1, ?, ?)
        `).run(
          custId,
          customer_name.trim(),
          cleanPhone,
          customer_email || null,
          JSON.stringify([delivery_address.trim()]),
          total,
          now,
          now
        );
      }

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    // Log Activity & Low Stock Alerts
    logActivity(
      'new_order',
      'success',
      customer_name.trim(),
      'customer',
      `New order ${orderNumber} placed for ₹${total} via ${payment_method.toUpperCase()}`,
      'order',
      orderId,
      `/admin`
    );

    // Check low stock for ordered products
    for (const vi of validatedItems) {
      const current = db.prepare('SELECT stock_quantity, reorder_level, name_en FROM products WHERE id = ?').get(vi.product.id) as any;
      if (current && current.stock_quantity <= current.reorder_level) {
        logActivity(
          'low_stock_alert',
          'warning',
          'Inventory Watch',
          'system',
          `Low stock alert: ${current.name_en} has only ${current.stock_quantity} left (reorder level: ${current.reorder_level})`,
          'product',
          vi.product.id,
          `/admin`
        );
      }
    }

    // WhatsApp Message Text Builder
    const itemsSummary = validatedItems
      .map((i) => `• ${i.product.name_en} (${i.product.unit}) x ${i.quantity} = ₹${i.total_price}`)
      .join('\n');

    const whatsappMessage = `*Jai Jinendra Grocery Mart Order Confirmation*\n` +
      `Order ID: ${orderNumber}\n` +
      `Customer: ${customer_name}\n` +
      `Phone: ${cleanPhone}\n` +
      `Address: ${delivery_address}, Jaora (${pincode})\n\n` +
      `*Items:*\n${itemsSummary}\n\n` +
      `Subtotal: ₹${subtotal}\n` +
      (discount > 0 ? `Discount: -₹${discount}\n` : '') +
      `Delivery Fee: ₹${deliveryFee}\n` +
      `*Total: ₹${total}*\n` +
      `Payment Mode: ${payment_method === 'demo_upi' ? 'Demo UPI (Verified)' : 'Cash on Delivery (COD)'}\n\n` +
      `Please confirm delivery to my Jaora address. Thank you!`;

    const whatsappUrl = `https://wa.me/919294646050?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json(
      {
        success: true,
        order: {
          id: orderId,
          order_number: orderNumber,
          customer_name,
          customer_phone: cleanPhone,
          delivery_address,
          pincode,
          subtotal,
          discount,
          delivery_fee: deliveryFee,
          total,
          payment_method,
          order_status: 'received',
          created_at: now,
        },
        whatsapp_url: whatsappUrl,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Order placement failed', details: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager', 'staff']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const db = getDatabase();
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND order_status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);

    // Attach items
    const ordersWithItems = orders.map((ord: any) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });

    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;

    return NextResponse.json({ orders: ordersWithItems, total: totalCount });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch orders', details: err.message }, { status: 500 });
  }
}
