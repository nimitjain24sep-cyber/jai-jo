import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const offers = db
      .prepare('SELECT * FROM offers WHERE active = 1 ORDER BY sort_order ASC, created_at DESC')
      .all();
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch offers', details: error.message }, { status: 500 });
  }
}
