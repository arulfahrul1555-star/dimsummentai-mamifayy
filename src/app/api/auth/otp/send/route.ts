import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: 'Masukkan nomor HP / WhatsApp yang valid (minimal 8 digit)' },
        { status: 400 }
      );
    }

    const result = await db.sendOtpToPhone(phone);

    return NextResponse.json({
      success: true,
      message: 'Kode OTP 4-digit berhasil dikirim!',
      data: {
        phone: result.phone,
        otpCode: result.code, // Returned for instant testing simulation
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengirim kode OTP' },
      { status: 400 }
    );
  }
}
