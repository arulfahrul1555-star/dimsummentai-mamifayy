import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [orders, customers] = await Promise.all([
      db.getOrders(),
      db.getCustomers(),
    ]);

    const todayStr = new Date().toISOString().slice(0, 10);

    let totalOmzet = 0;
    let todayOmzet = 0;
    let todayOrdersCount = 0;
    let pendingApprovalCount = 0;
    let inProgressCount = 0;

    let totalQrisAmount = 0;
    let totalCodAmount = 0;

    const portionCounts: Record<number, number> = { 4: 0, 6: 0, 8: 0, 10: 0, 16: 0 };
    const productCounts: Record<string, number> = {};

    for (const order of orders) {
      if (order.status === 'dibatalkan') continue;

      // Omzet calculations
      if (order.status === 'selesai' || order.paymentStatus === 'lunas') {
        totalOmzet += order.totalAmount;
        if (order.createdAt.startsWith(todayStr)) {
          todayOmzet += order.totalAmount;
        }

        // Cash vs QRIS audit
        if (order.paymentMethod === 'qris') {
          totalQrisAmount += order.totalAmount;
        } else if (order.paymentMethod === 'cod') {
          totalCodAmount += order.totalAmount;
        }
      }

      if (order.createdAt.startsWith(todayStr)) {
        todayOrdersCount++;
      }

      if (order.status === 'menunggu_konfirmasi') {
        pendingApprovalCount++;
      }

      if (order.status === 'diproses' || order.status === 'dikirim' || order.status === 'siap_pickup') {
        inProgressCount++;
      }

      // Items breakdown
      for (const item of (order.items || [])) {
        if (portionCounts[item.portion] !== undefined) {
          portionCounts[item.portion] += item.quantity;
        }
        productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOmzet,
        todayOmzet,
        todayOrdersCount,
        pendingApprovalCount,
        inProgressCount,
        totalCustomers: customers.length,
        dormantCustomersCount: customers.filter((c) => c.tag === 'lama_tidak_order').length,
        loyalCustomersCount: customers.filter((c) => c.tag === 'loyal').length,
        totalQrisAmount,
        totalCodAmount,
        portionCounts,
        productCounts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat analitik' },
      { status: 500 }
    );
  }
}
