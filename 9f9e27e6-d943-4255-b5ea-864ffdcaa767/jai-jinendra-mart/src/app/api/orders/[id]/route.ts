import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager', 'staff']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getDatabase();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(params.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(params.id);

    return NextResponse.json({ order: { ...order, items, payment } });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch order', details: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager', 'staff']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { order_status, notes, cancel_reason, payment_status } = body;

    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updatedStatus = order_status || existing.order_status;
    const updatedPaymentStatus = payment_status || existing.payment_status;

    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare(`
        UPDATE orders
        SET order_status = ?,
            payment_status = ?,
            notes = ?,
            cancel_reason = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        updatedStatus,
        updatedPaymentStatus,
        notes !== undefined ? notes : existing.notes,
        cancel_reason !== undefined ? cancel_reason : existing.cancel_reason,
        now,
        params.id
      );

      // If status changed to cancelled or refunded from a previously active status, restock items
      if (
        (updatedStatus === 'cancelled' || updatedStatus === 'refunded') &&
        existing.order_status !== 'cancelled' &&
        existing.order_status !== 'refunded'
      ) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(params.id) as any[];
        for (const it of items) {
          db.prepare('UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = ? WHERE id = ?').run(
            it.quantity,
            now,
            it.product_id
          );
        }
      }

      // If payment status changed, update payments table
      if (payment_status) {
        db.prepare('UPDATE payments SET payment_status = ? WHERE order_id = ?').run(payment_status, params.id);
      }

      db.exec('COMMIT;');
    } catch (e) {
      db.exec('ROLLBACK;');
      throw e;
    }

    logActivity(
      'order_status_change',
      updatedStatus === 'cancelled' || updatedStatus === 'refunded' ? 'warning' : 'info',
      auth.session!.name,
      'admin',
      `Order ${existing.order_number} status updated to ${updatedStatus.toUpperCase()}`,
      'order',
      params.id,
      `/admin`
    );

    logAudit('UPDATE_ORDER_STATUS', 'orders', auth.session!.email, auth.session!.id, {
      order_id: params.id,
      old_status: existing.order_status,
      new_status: updatedStatus,
      reason: cancel_reason,
    });

    return NextResponse.json({ success: true, order_status: updatedStatus });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update order', details: err.message }, { status: 500 });
  }
}
