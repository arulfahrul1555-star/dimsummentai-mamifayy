import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || phone.length < 5) {
      return NextResponse.json({ success: false, message: 'Nomor WhatsApp tidak valid' }, { status: 400 });
    }

    const customer = await db.getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: {
          isRegistered: false,
          points: 0,
          name: '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isRegistered: true,
        name: customer.name,
        points: customer.points || 0,
        totalOrders: customer.totalOrders,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengecek poin' }, { status: 500 });
  }
}
