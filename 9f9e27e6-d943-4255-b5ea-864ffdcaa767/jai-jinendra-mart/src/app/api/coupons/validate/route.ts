import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code required' }, { status: 400 });
    }

    const db = getDatabase();
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.toUpperCase()) as any;

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.valid_from > today || coupon.valid_to < today) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' }, { status: 400 });
    }

    if (subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        {
          valid: false,
          message: `This coupon requires a minimum cart total of ₹${coupon.min_order_amount}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      discount,
      coupon,
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 });
  }
}
