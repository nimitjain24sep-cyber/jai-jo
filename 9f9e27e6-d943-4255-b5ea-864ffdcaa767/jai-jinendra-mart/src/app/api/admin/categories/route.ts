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
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name_en ASC').all();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch categories', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name_en, name_hi, slug, icon = '🌾', sort_order = 0, active = 1 } = body;

    if (!name_en || !name_hi) {
      return NextResponse.json({ error: 'Category name (EN and HI) is required' }, { status: 400 });
    }

    const db = getDatabase();
    const catSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const catId = id || 'cat-' + Date.now();
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(catId);

    if (existing) {
      db.prepare(`
        UPDATE categories SET name_en = ?, name_hi = ?, slug = ?, icon = ?, sort_order = ?, active = ?, updated_at = ?
        WHERE id = ?
      `).run(name_en, name_hi, catSlug, icon, sort_order, active ? 1 : 0, now, catId);

      logAudit('UPDATE_CATEGORY', `Category:${catId}`, admin.email, admin.id, { name_en });
      logActivity('product_edit', 'info', admin.name, 'admin', `Updated category "${name_en}"`, 'category', catId, '/admin');

      return NextResponse.json({ success: true, message: 'Category updated successfully', id: catId });
    } else {
      db.prepare(`
        INSERT INTO categories (id, name_en, name_hi, slug, icon, sort_order, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(catId, name_en, name_hi, catSlug, icon, sort_order, active ? 1 : 0, now, now);

      logAudit('CREATE_CATEGORY', `Category:${catId}`, admin.email, admin.id, { name_en });
      logActivity('product_edit', 'success', admin.name, 'admin', `Created new category "${name_en}"`, 'category', catId, '/admin');

      return NextResponse.json({ success: true, message: 'Category created successfully', id: catId });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save category', details: err.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    logAudit('DELETE_CATEGORY', `Category:${id}`, admin.email, admin.id);
    logActivity('product_edit', 'warning', admin.name, 'admin', `Deleted category ${id}`, 'category', id, '/admin');

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete category', details: err.message }, { status: 500 });
  }
}
