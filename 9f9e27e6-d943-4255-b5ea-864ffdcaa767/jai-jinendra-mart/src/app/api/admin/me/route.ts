import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT id, name, email, role, two_factor_enabled, active, last_login FROM admin_users WHERE id = ?').get(session.id) as any;

  if (!user || !user.active) {
    return NextResponse.json({ error: 'User is inactive or deleted' }, { status: 403 });
  }

  return NextResponse.json({ user });
}
