import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { order_id, phone } = await req.json();

    if (!order_id || !phone) {
      return NextResponse.json(
        { error: 'Both Order ID and 10-digit Phone number are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanOrderId = order_id.trim();

    const db = getDatabase();

    // Query must match both the order identifier (id or order_number) AND the customer phone
    const order = db
      .prepare(
        `SELECT * FROM orders
         WHERE (id = ? OR order_number = ?)
           AND customer_phone = ?`
      )
      .get(cleanOrderId, cleanOrderId, cleanPhone) as any;

    if (!order) {
      // Intentionally generic to prevent phone number or order ID enumeration
      return NextResponse.json(
        { error: 'No matching order found with the provided Order ID and Phone Number.' },
        { status: 404 }
      );
    }

    // Fetch order items
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    // Timeline construction based on status
    const statusOrder = ['received', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.order_status);

    const timeline = statusOrder.map((st, idx) => ({
      status: st,
      completed: currentIndex >= idx && order.order_status !== 'cancelled' && order.order_status !== 'refunded',
      current: order.order_status === st,
    }));

    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        landmark: order.landmark,
        pincode: order.pincode,
        subtotal: order.subtotal,
        discount: order.discount,
        delivery_fee: order.delivery_fee,
        tax: order.tax,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        cancel_reason: order.cancel_reason,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items,
        timeline,
        estimated_delivery: '45 - 60 Minutes (Jaora Local Delivery)',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Order tracking failed', details: err.message }, { status: 500 });
  }
}
