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
