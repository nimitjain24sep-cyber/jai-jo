import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { getAdminUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const settings = db.prepare('SELECT * FROM store_settings LIMIT 1').get();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch settings', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleUpdate(req);
}

export async function PUT(req: NextRequest) {
  return handleUpdate(req);
}

async function handleUpdate(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM store_settings LIMIT 1').get() as any;

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE store_settings SET
        store_name = ?,
        store_name_hi = ?,
        phone = ?,
        whatsapp = ?,
        address = ?,
        address_hi = ?,
        city = ?,
        state = ?,
        pincode = ?,
        business_hours = ?,
        business_hours_hi = ?,
        delivery_fee = ?,
        min_order_amount = ?,
        free_delivery_threshold = ?,
        estimated_delivery_min = ?,
        demo_upi_id = ?,
        demo_account_name = ?,
        demo_account_number = ?,
        demo_ifsc = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      body.store_name ?? existing.store_name,
      body.store_name_hi ?? existing.store_name_hi,
      body.phone ?? existing.phone,
      body.whatsapp ?? existing.whatsapp,
      body.address ?? existing.address,
      body.address_hi ?? existing.address_hi,
      body.city ?? existing.city,
      body.state ?? existing.state,
      body.pincode ?? existing.pincode,
      body.business_hours ?? existing.business_hours,
      body.business_hours_hi ?? existing.business_hours_hi,
      Number(body.delivery_fee) ?? existing.delivery_fee,
      Number(body.min_order_amount) ?? existing.min_order_amount,
      Number(body.free_delivery_threshold) ?? existing.free_delivery_threshold,
      Number(body.estimated_delivery_min) ?? existing.estimated_delivery_min,
      body.demo_upi_id ?? existing.demo_upi_id,
      body.demo_account_name ?? existing.demo_account_name,
      body.demo_account_number ?? existing.demo_account_number,
      body.demo_ifsc ?? existing.demo_ifsc,
      now,
      existing.id
    );

    logActivity('product_edit', 'info', admin.name, 'admin', 'Store settings and website content updated', 'settings', existing.id, '/admin');
    logAudit('UPDATE_SETTINGS', 'store_settings', admin.email, admin.id, { changes: body });

    return NextResponse.json({ success: true, message: 'Website settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update settings', details: err.message }, { status: 500 });
  }
}
