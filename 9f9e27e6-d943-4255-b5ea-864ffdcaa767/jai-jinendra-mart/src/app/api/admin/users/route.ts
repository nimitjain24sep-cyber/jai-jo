import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logActivity, logAudit } from '@/lib/db';
import { getAdminUserFromRequest, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDatabase();
    const users = db.prepare('SELECT id, name, email, role, active, last_login, created_at FROM admin_users ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch admin users', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin permission required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, email, password, role = 'manager', active = 1 } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const db = getDatabase();
    const userId = id || 'usr-' + Date.now();
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM admin_users WHERE id = ?').get(userId);

    if (existing) {
      if (password && password.trim().length > 0) {
        const password_hash = hashPassword(password);
        db.prepare(`
          UPDATE admin_users SET name = ?, email = ?, password_hash = ?, role = ?, active = ?, updated_at = ?
          WHERE id = ?
        `).run(name, email.toLowerCase(), password_hash, role, active ? 1 : 0, now, userId);
      } else {
        db.prepare(`
          UPDATE admin_users SET name = ?, email = ?, role = ?, active = ?, updated_at = ?
          WHERE id = ?
        `).run(name, email.toLowerCase(), role, active ? 1 : 0, now, userId);
      }

      logAudit('UPDATE_ADMIN_USER', `User:${userId}`, admin.email, admin.id, { email, role });
      logActivity('admin_login', 'info', admin.name, 'admin', `Updated staff user account "${email}"`, 'user', userId, '/admin');

      return NextResponse.json({ success: true, message: 'Staff user updated successfully', id: userId });
    } else {
      if (!password) {
        return NextResponse.json({ error: 'Password is required for new user' }, { status: 400 });
      }
      const password_hash = hashPassword(password);
      db.prepare(`
        INSERT INTO admin_users (id, name, email, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, name, email.toLowerCase(), password_hash, role, active ? 1 : 0, now, now);

      logAudit('CREATE_ADMIN_USER', `User:${userId}`, admin.email, admin.id, { email, role });
      logActivity('admin_login', 'success', admin.name, 'admin', `Created new staff user account "${email}"`, 'user', userId, '/admin');

      return NextResponse.json({ success: true, message: 'Staff user created successfully', id: userId });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save staff user', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUserFromRequest(req);
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super Admin permission required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (id === admin.id) {
      return NextResponse.json({ error: 'Cannot delete your own account while logged in' }, { status: 400 });
    }

    const db = getDatabase();
    db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);

    logAudit('DELETE_ADMIN_USER', `User:${id}`, admin.email, admin.id);
    logActivity('admin_login', 'warning', admin.name, 'admin', `Deleted staff account ${id}`, 'user', id, '/admin');

    return NextResponse.json({ success: true, message: 'Staff user deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete staff user', details: err.message }, { status: 500 });
  }
}
