import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, otp, name } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Nomor HP dan kode OTP wajib diisi' },
        { status: 400 }
      );
    }

    const customer = await db.verifyOtpAndLogin(phone, otp, name);

    return NextResponse.json({
      success: true,
      message: 'Verifikasi OTP berhasil! Selamat datang.',
      data: customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Verifikasi OTP gagal' },
      { status: 400 }
    );
  }
}
