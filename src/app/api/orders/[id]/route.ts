import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    return NextResponse.json({ success: true, data: order }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.updateOrder(params.id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pesanan' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await db.deleteOrder(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan atau gagal dihapus' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Pesanan berhasil dihapus' },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menghapus pesanan' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}


