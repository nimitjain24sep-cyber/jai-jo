import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logAudit, logActivity } from '@/lib/db';
import { getAdminUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const offers = db.prepare('SELECT * FROM offers ORDER BY sort_order ASC, created_at DESC').all();
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch offers', details: error.message }, { status: 500 });
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
      title_en,
      title_hi,
      description_en,
      description_hi,
      discount_badge,
      promo_code,
      banner_url,
      active = 1,
      sort_order = 0,
    } = body;

    if (!title_en || !title_hi || !discount_badge) {
      return NextResponse.json({ error: 'Title (EN/HI) and discount badge are required' }, { status: 400 });
    }

    const db = getDatabase();
    const id = body.id || 'offer-' + Date.now();
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM offers WHERE id = ?').get(id);

    if (existing) {
      // Update
      db.prepare(`
        UPDATE offers
        SET title_en = ?, title_hi = ?, description_en = ?, description_hi = ?, discount_badge = ?, promo_code = ?, banner_url = ?, active = ?, sort_order = ?, updated_at = ?
        WHERE id = ?
      `).run(
        title_en,
        title_hi,
        description_en || '',
        description_hi || '',
        discount_badge,
        promo_code || null,
        banner_url || null,
        active ? 1 : 0,
        sort_order,
        now,
        id
      );

      logAudit('UPDATE_OFFER', `Offer:${id}`, admin.email, admin.id, { title_en });
      logActivity('product_edit', 'info', admin.name, 'admin', `Updated promotional offer "${title_en}"`, 'offer', id, '/admin');

      return NextResponse.json({ success: true, message: 'Offer updated successfully', id });
    } else {
      // Insert
      db.prepare(`
        INSERT INTO offers (id, title_en, title_hi, description_en, description_hi, discount_badge, promo_code, banner_url, active, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        title_en,
        title_hi,
        description_en || '',
        description_hi || '',
        discount_badge,
        promo_code || null,
        banner_url || null,
        active ? 1 : 0,
        sort_order,
        now,
        now
      );

      logAudit('CREATE_OFFER', `Offer:${id}`, admin.email, admin.id, { title_en });
      logActivity('product_edit', 'success', admin.name, 'admin', `Created new promotional offer "${title_en}"`, 'offer', id, '/admin');

      return NextResponse.json({ success: true, message: 'Offer created successfully', id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save offer', details: error.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM offers WHERE id = ?').run(id);

    logAudit('DELETE_OFFER', `Offer:${id}`, admin.email, admin.id);
    logActivity('product_edit', 'warning', admin.name, 'admin', `Deleted offer ${id}`, 'offer', id, '/admin');

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete offer', details: error.message }, { status: 500 });
  }
}
