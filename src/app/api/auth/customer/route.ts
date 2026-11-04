import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama pemesan wajib diisi' },
        { status: 400 }
      );
    }

    const customer = await db.loginOrRegisterCustomer(name, password);

    return NextResponse.json({
      success: true,
      message: 'Berhasil masuk ke akun member',
      data: customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal login pelanggan' },
      { status: 400 }
    );
  }
}
