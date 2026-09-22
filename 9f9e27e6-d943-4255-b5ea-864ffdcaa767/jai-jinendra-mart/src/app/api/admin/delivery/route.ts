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
    const rules = db.prepare('SELECT * FROM delivery_rules ORDER BY base_fee ASC').all();
    return NextResponse.json({ success: true, rules });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch delivery rules', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, zone_name, pincode = '457226', base_fee = 30, min_order = 100, free_threshold = 499, estimated_minutes = 60, active = 1 } = body;

    if (!zone_name) {
      return NextResponse.json({ error: 'Zone name is required' }, { status: 400 });
    }

    const db = getDatabase();
    const ruleId = id || 'rule-' + Date.now();

    const existing = db.prepare('SELECT id FROM delivery_rules WHERE id = ?').get(ruleId);

    if (existing) {
      db.prepare(`
        UPDATE delivery_rules SET zone_name = ?, pincode = ?, base_fee = ?, min_order = ?, free_threshold = ?, estimated_minutes = ?, active = ?
        WHERE id = ?
      `).run(zone_name, pincode, Number(base_fee), Number(min_order), Number(free_threshold), Number(estimated_minutes), active ? 1 : 0, ruleId);

      logAudit('UPDATE_DELIVERY_RULE', `Rule:${ruleId}`, admin.email, admin.id, { zone_name });
      logActivity('product_edit', 'info', admin.name, 'admin', `Updated delivery zone "${zone_name}"`, 'delivery', ruleId, '/admin');

      return NextResponse.json({ success: true, message: 'Delivery rule updated successfully', id: ruleId });
    } else {
      db.prepare(`
        INSERT INTO delivery_rules (id, zone_name, pincode, base_fee, min_order, free_threshold, estimated_minutes, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(ruleId, zone_name, pincode, Number(base_fee), Number(min_order), Number(free_threshold), Number(estimated_minutes), active ? 1 : 0);

      logAudit('CREATE_DELIVERY_RULE', `Rule:${ruleId}`, admin.email, admin.id, { zone_name });
      logActivity('product_edit', 'success', admin.name, 'admin', `Created new delivery zone "${zone_name}"`, 'delivery', ruleId, '/admin');

      return NextResponse.json({ success: true, message: 'Delivery rule created successfully', id: ruleId });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save delivery rule', details: err.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM delivery_rules WHERE id = ?').run(id);

    logAudit('DELETE_DELIVERY_RULE', `Rule:${id}`, admin.email, admin.id);
    logActivity('product_edit', 'warning', admin.name, 'admin', `Deleted delivery rule ${id}`, 'delivery', id, '/admin');

    return NextResponse.json({ success: true, message: 'Delivery rule deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete delivery rule', details: err.message }, { status: 500 });
  }
}
