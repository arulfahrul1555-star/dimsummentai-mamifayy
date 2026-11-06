import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    let customers = await db.getCustomers();

    if (tag && tag !== 'all') {
      customers = customers.filter((c) => c.tag === tag);
    }

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data pelanggan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Nama dan nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    const customer = await db.createCustomer({
      name: body.name,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menambahkan data pelanggan' },
      { status: 500 }
    );
  }
}
