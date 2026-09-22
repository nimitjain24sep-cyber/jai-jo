import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { requireAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id) as any;
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        image_urls: JSON.parse(product.image_urls_json || '[]'),
        featured: Boolean(product.featured),
        active: Boolean(product.active),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch product', details: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE products SET
        name_en = ?,
        name_hi = ?,
        description_en = ?,
        description_hi = ?,
        image_urls_json = ?,
        category_id = ?,
        sku = ?,
        barcode = ?,
        unit = ?,
        mrp = ?,
        selling_price = ?,
        discount_percent = ?,
        gst_rate = ?,
        hsn_code = ?,
        stock_quantity = ?,
        reorder_level = ?,
        featured = ?,
        active = ?,
        sort_order = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      body.name_en !== undefined ? body.name_en : existing.name_en,
      body.name_hi !== undefined ? body.name_hi : existing.name_hi,
      body.description_en !== undefined ? body.description_en : existing.description_en,
      body.description_hi !== undefined ? body.description_hi : existing.description_hi,
      body.image_urls ? JSON.stringify(body.image_urls) : existing.image_urls_json,
      body.category_id || existing.category_id,
      body.sku || existing.sku,
      body.barcode !== undefined ? body.barcode : existing.barcode,
      body.unit || existing.unit,
      body.mrp !== undefined ? Number(body.mrp) : existing.mrp,
      body.selling_price !== undefined ? Number(body.selling_price) : existing.selling_price,
      body.discount_percent !== undefined ? Number(body.discount_percent) : existing.discount_percent,
      body.gst_rate !== undefined ? Number(body.gst_rate) : existing.gst_rate,
      body.hsn_code || existing.hsn_code,
      body.stock_quantity !== undefined ? Number(body.stock_quantity) : existing.stock_quantity,
      body.reorder_level !== undefined ? Number(body.reorder_level) : existing.reorder_level,
      body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
      body.active !== undefined ? (body.active ? 1 : 0) : existing.active,
      body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
      now,
      params.id
    );

    logActivity('product_edit', 'info', auth.session!.name, 'admin', `Product updated: ${body.name_en || existing.name_en}`, 'product', params.id, `/shop`);
    logAudit('UPDATE_PRODUCT', 'products', auth.session!.email, auth.session!.id, { id: params.id, changes: body });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update product', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminRole(req, ['super_admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getDatabase();
    const product = db.prepare('SELECT name_en, active FROM products WHERE id = ?').get(params.id) as any;
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newActiveState = product.active ? 0 : 1;
    db.prepare('UPDATE products SET active = ?, updated_at = ? WHERE id = ?').run(
      newActiveState,
      new Date().toISOString(),
      params.id
    );

    const actionText = newActiveState ? 'Restored' : 'Archived';
    logActivity('product_edit', 'warning', auth.session!.name, 'admin', `Product ${actionText}: ${product.name_en}`, 'product', params.id, `/shop`);
    logAudit(`${actionText.toUpperCase()}_PRODUCT`, 'products', auth.session!.email, auth.session!.id, { id: params.id });

    return NextResponse.json({ success: true, active: Boolean(newActiveState) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to archive product', details: err.message }, { status: 500 });
  }
}
