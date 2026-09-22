import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDatabase();
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch categories', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { name_en, name_hi, slug, icon, sort_order } = body;
    if (!name_en || !name_hi || !slug) {
      return NextResponse.json({ error: 'Missing required category fields' }, { status: 400 });
    }

    const db = getDatabase();
    const id = 'cat-' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO categories (id, name_en, name_hi, slug, icon, sort_order, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, name_en, name_hi, slug, icon || 'ShoppingBag', Number(sort_order) || 0, now, now);

    logActivity('product_edit', 'info', auth.session!.name, 'admin', `Category added: ${name_en}`, 'category', id, `/shop`);
    logAudit('CREATE_CATEGORY', 'categories', auth.session!.email, auth.session!.id, { id, name_en });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save category', details: err.message }, { status: 500 });
  }
}
