import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const inStock = searchParams.get('in_stock') === 'true';
    const sort = searchParams.get('sort') || 'featured';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (!includeInactive) {
      query += ' AND active = 1';
    }

    if (category && category !== 'all') {
      query += ' AND category_id = ?';
      params.push(category);
    }

    if (inStock) {
      query += ' AND stock_quantity > 0';
    }

    if (search) {
      query += ' AND (name_en LIKE ? OR name_hi LIKE ? OR description_en LIKE ? OR description_hi LIKE ? OR sku LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY selling_price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY selling_price DESC';
    } else if (sort === 'name') {
      query += ' ORDER BY name_en ASC';
    } else {
      query += ' ORDER BY featured DESC, sort_order ASC, created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const products = stmt.all(...params).map((p: any) => ({
      ...p,
      image_urls: JSON.parse(p.image_urls_json || '[]'),
      featured: Boolean(p.featured),
      active: Boolean(p.active),
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams: any[] = [];
    if (!includeInactive) countQuery += ' AND active = 1';
    if (category && category !== 'all') {
      countQuery += ' AND category_id = ?';
      countParams.push(category);
    }
    if (inStock) countQuery += ' AND stock_quantity > 0';
    if (search) {
      countQuery += ' AND (name_en LIKE ? OR name_hi LIKE ? OR description_en LIKE ? OR description_hi LIKE ? OR sku LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s, s, s);
    }
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...countParams) as { total: number };

    return NextResponse.json({
      products,
      total: countResult.total,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error('Failed to fetch products:', err);
    return NextResponse.json({ error: 'Failed to fetch products', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const {
      name_en,
      name_hi,
      description_en,
      description_hi,
      image_urls,
      category_id,
      sku,
      barcode,
      unit,
      mrp,
      selling_price,
      discount_percent,
      gst_rate,
      hsn_code,
      stock_quantity,
      reorder_level,
      featured,
      active,
      sort_order,
    } = body;

    if (!name_en || !name_hi || !unit || selling_price === undefined) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const db = getDatabase();
    const id = 'prod-' + Date.now();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (
        id, name_en, name_hi, description_en, description_hi, image_urls_json,
        category_id, sku, barcode, unit, mrp, selling_price, discount_percent,
        gst_rate, hsn_code, stock_quantity, reorder_level, featured, active,
        sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name_en,
      name_hi,
      description_en || '',
      description_hi || '',
      JSON.stringify(image_urls || []),
      category_id || 'cat-staples',
      sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      barcode || '',
      unit,
      Number(mrp) || Number(selling_price),
      Number(selling_price),
      Number(discount_percent) || 0,
      Number(gst_rate) || 0,
      hsn_code || '0000',
      Number(stock_quantity) || 0,
      Number(reorder_level) || 5,
      featured ? 1 : 0,
      active !== undefined ? (active ? 1 : 0) : 1,
      Number(sort_order) || 0,
      now,
      now
    );

    logActivity('product_edit', 'success', auth.session!.name, 'admin', `Product added: ${name_en}`, 'product', id, `/shop`);
    logAudit('CREATE_PRODUCT', 'products', auth.session!.email, auth.session!.id, { id, name_en });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create product', details: err.message }, { status: 500 });
  }
}
