import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { customerId, rewardType } = await request.json();

    if (!customerId || !rewardType) {
      return NextResponse.json(
        { success: false, message: 'Data penukaran tidak lengkap' },
        { status: 400 }
      );
    }

    if (!['voucher_10', 'voucher_20', 'dimsum_original_5'].includes(rewardType)) {
      return NextResponse.json(
        { success: false, message: 'Jenis penukaran tidak valid' },
        { status: 400 }
      );
    }

    const result = await db.redeemCustomerReward(customerId, rewardType);

    return NextResponse.json({
      success: true,
      message: 'Penukaran poin berhasil!',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menukarkan poin' },
      { status: 400 }
    );
  }
}
