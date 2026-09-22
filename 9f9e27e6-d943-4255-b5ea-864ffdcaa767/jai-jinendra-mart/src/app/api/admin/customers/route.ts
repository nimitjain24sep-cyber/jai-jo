import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { getAdminUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('id');

    const db = getDatabase();

    if (customerId) {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as any;
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const orders = db.prepare('SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC').all(customer.phone);
      const reviews = db.prepare('SELECT * FROM customer_reviews WHERE customer_phone = ? OR customer_id = ? ORDER BY created_at DESC').all(customer.phone, customerId);

      return NextResponse.json({
        success: true,
        customer,
        orders,
        reviews,
      });
    }

    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all() as any[];

    // Enrich customer records with orders and reviews count
    const enrichedCustomers = customers.map((c) => {
      const orders = db.prepare('SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC').all(c.phone) as any[];
      const reviews = db.prepare('SELECT * FROM customer_reviews WHERE customer_phone = ? OR customer_id = ?').all(c.phone, c.id) as any[];
      return {
        ...c,
        orders,
        reviews,
        recent_order: orders[0] || null,
      };
    });

    return NextResponse.json({ success: true, customers: enrichedCustomers });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch customers', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare('UPDATE customers SET active = ?, updated_at = ? WHERE id = ?').run(active ? 1 : 0, now, id);

    logAudit('UPDATE_CUSTOMER', `Customer:${id}`, admin.email, admin.id, { active });
    logActivity('customer_registration', 'info', admin.name, 'admin', `Updated customer account status ${id}`, 'customer', id, '/admin');

    return NextResponse.json({ success: true, message: 'Customer updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update customer', details: err.message }, { status: 500 });
  }
}
