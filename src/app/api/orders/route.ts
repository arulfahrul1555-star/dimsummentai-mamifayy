import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');

    let orders = await db.getOrders();

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }
    if (paymentMethod && paymentMethod !== 'all') {
      orders = orders.filter((o) => o.paymentMethod === paymentMethod);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data pesanan tidak lengkap' },
        { status: 400 }
      );
    }

    // Default status for new public orders is 'menunggu_konfirmasi'
    // Default delivery fee is 0 until admin inputs manual delivery fee (if kurir_toko)
    const newOrder = await db.createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress || '',
      customerNotes: body.customerNotes || '',
      deliveryType: body.deliveryType || 'pickup',
      deliveryFee: body.deliveryFee || 0,
      paymentMethod: body.paymentMethod || 'qris',
      paymentStatus: body.paymentStatus || 'menunggu_pembayaran',
      status: body.status || 'menunggu_konfirmasi',
      items: body.items,
      itemsTotal: body.itemsTotal,
      discountAmount: body.discountAmount || 0,
      voucherCode: body.voucherCode || '',
      pointsUsed: body.pointsUsed || 0,
      totalAmount: Math.max(
        0,
        (body.itemsTotal || 0) - (body.discountAmount || 0) + (body.deliveryFee || 0)
      ),
      channel: body.channel || 'website',
      adminNotes: body.adminNotes || '',
    });

    return NextResponse.json({ success: true, data: newOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan' },
      { status: 500 }
    );
  }
}
