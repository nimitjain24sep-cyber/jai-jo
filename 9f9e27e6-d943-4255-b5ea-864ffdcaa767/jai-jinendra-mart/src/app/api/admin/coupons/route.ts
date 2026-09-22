import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { getAdminUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDatabase();
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch coupons', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      code,
      discount_type,
      discount_value,
      min_order_amount = 0,
      max_discount = null,
      usage_limit = 1000,
      valid_from = '2026-01-01',
      valid_to = '2027-12-31',
      active = 1,
    } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Code, discount type, and discount value are required' }, { status: 400 });
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const couponId = id || 'cp-' + Date.now();

    const existing = db.prepare('SELECT id FROM coupons WHERE id = ? OR code = ?').get(couponId, code.toUpperCase()) as any;

    if (existing && existing.id === couponId) {
      db.prepare(`
        UPDATE coupons SET
          code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, max_discount = ?, usage_limit = ?, valid_from = ?, valid_to = ?, active = ?
        WHERE id = ?
      `).run(
        code.toUpperCase(),
        discount_type,
        Number(discount_value),
        Number(min_order_amount),
        max_discount ? Number(max_discount) : null,
        Number(usage_limit),
        valid_from,
        valid_to,
        active ? 1 : 0,
        couponId
      );

      logAudit('UPDATE_COUPON', `Coupon:${couponId}`, admin.email, admin.id, { code });
      logActivity('product_edit', 'info', admin.name, 'admin', `Updated coupon ${code.toUpperCase()}`, 'coupon', couponId, '/admin');

      return NextResponse.json({ success: true, message: 'Coupon updated successfully', id: couponId });
    } else {
      db.prepare(`
        INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, valid_from, valid_to, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        couponId,
        code.toUpperCase(),
        discount_type,
        Number(discount_value),
        Number(min_order_amount),
        max_discount ? Number(max_discount) : null,
        Number(usage_limit),
        0,
        valid_from,
        valid_to,
        active ? 1 : 0,
        now
      );

      logAudit('CREATE_COUPON', `Coupon:${couponId}`, admin.email, admin.id, { code });
      logActivity('product_edit', 'success', admin.name, 'admin', `Created coupon ${code.toUpperCase()}`, 'coupon', couponId, '/admin');

      return NextResponse.json({ success: true, message: 'Coupon created successfully', id: couponId });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save coupon', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);

    logAudit('DELETE_COUPON', `Coupon:${id}`, admin.email, admin.id);
    logActivity('product_edit', 'warning', admin.name, 'admin', `Deleted coupon ${id}`, 'coupon', id, '/admin');

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete coupon', details: err.message }, { status: 500 });
  }
}
