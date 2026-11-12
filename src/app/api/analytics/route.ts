import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

const WIB_TIMEZONE = 'Asia/Jakarta';
const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const wibDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: WIB_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const wibLabelFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: WIB_TIMEZONE,
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function toWibDateKey(isoOrDate: string | Date): string {
  const parsed = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return wibDateFormatter.format(safeDate);
}

function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  return `${INDONESIAN_MONTHS[monthIdx] || monthStr} ${yearStr}`;
}

function formatDateLabelFromKey(dateKey: string): string {
  // Parse YYYY-MM-DD at noon WIB so weekday/date formatting stays exact
  const d = new Date(`${dateKey}T12:00:00+07:00`);
  return Number.isNaN(d.getTime()) ? dateKey : wibLabelFormatter.format(d);
}

function buildDateKeysForPeriod(selectedMonth: string, todayKey: string): string[] {
  const keys: string[] = [];
  if (selectedMonth === 'last30') {
    const end = new Date(`${todayKey}T12:00:00+07:00`);
    for (let offset = 29; offset >= 0; offset--) {
      const d = new Date(end.getTime() - offset * 24 * 60 * 60 * 1000);
      keys.push(toWibDateKey(d));
    }
    return keys;
  }

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (!year || !month || month < 1 || month > 12) {
    return buildDateKeysForPeriod('last30', todayKey);
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day++) {
    keys.push(`${yearStr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return keys;
}

interface DailyAccumulator {
  date: string;
  dateLabel: string;
  ordersCount: number;
  completedCount: number;
  boxesCount: number;
  qrisAmount: number;
  codAmount: number;
  totalOmzet: number;
  settledOmzet: number;
}

function isOrderSettled(order: Order): boolean {
  return order.status === 'selesai' || order.paymentStatus === 'lunas';
}

function countOrderBoxes(order: Order): number {
  return (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedMonth = (searchParams.get('month') || 'last30').trim();

    const [orders, customers] = await Promise.all([
      db.getOrders(),
      db.getCustomers(),
    ]);

    const todayKey = toWibDateKey(new Date());
    const currentMonthKey = todayKey.slice(0, 7);
    const last30CutoffDate = new Date(`${todayKey}T00:00:00+07:00`);
    last30CutoffDate.setDate(last30CutoffDate.getDate() - 29);
    const last30CutoffKey = toWibDateKey(last30CutoffDate);

    let totalOmzet = 0;
    let settledOmzet = 0;
    let pendingOmzet = 0;

    let todayOmzet = 0;
    let todaySettledOmzet = 0;
    let todayPendingOmzet = 0;
    let todayOrdersCount = 0;
    let todayCompletedCount = 0;

    let monthOmzet = 0;
    let monthOrdersCount = 0;
    let last30Omzet = 0;
    let last30OrdersCount = 0;

    let pendingApprovalCount = 0;
    let inProgressCount = 0;

    let totalQrisAmount = 0;
    let totalCodAmount = 0;
    let settledQrisAmount = 0;
    let settledCodAmount = 0;

    const portionCounts: Record<number, number> = { 3: 0, 4: 0, 6: 0, 8: 0, 10: 0, 14: 0, 16: 0 };
    const productCounts: Record<string, number> = {};
    const monthSet = new Set<string>([currentMonthKey]);

    const selectedMonth =
      requestedMonth === 'last30' || /^\d{4}-\d{2}$/.test(requestedMonth)
        ? requestedMonth
        : 'last30';

    const dailyMap: Record<string, DailyAccumulator> = {};

    for (const order of orders) {
      if (order.status === 'dibatalkan') continue;

      const amount = Number(order.totalAmount) || 0;
      const orderDateKey = toWibDateKey(order.createdAt);
      const orderMonthKey = orderDateKey.slice(0, 7);
      const settled = isOrderSettled(order);
      const boxes = countOrderBoxes(order);

      monthSet.add(orderMonthKey);

      // Real-time cumulative totals across all valid non-cancelled orders
      totalOmzet += amount;
      if (settled) {
        settledOmzet += amount;
      } else {
        pendingOmzet += amount;
      }

      if (order.paymentMethod === 'qris') {
        totalQrisAmount += amount;
        if (settled) settledQrisAmount += amount;
      } else if (order.paymentMethod === 'cod') {
        totalCodAmount += amount;
        if (settled) settledCodAmount += amount;
      }

      // Today (WIB)
      if (orderDateKey === todayKey) {
        todayOrdersCount++;
        todayOmzet += amount;
        if (settled) {
          todaySettledOmzet += amount;
          todayCompletedCount++;
        } else {
          todayPendingOmzet += amount;
        }
      }

      // Current WIB calendar month
      if (orderMonthKey === currentMonthKey) {
        monthOrdersCount++;
        monthOmzet += amount;
      }

      // Rolling 30 days (WIB)
      if (orderDateKey >= last30CutoffKey && orderDateKey <= todayKey) {
        last30OrdersCount++;
        last30Omzet += amount;
      }

      if (order.status === 'menunggu_konfirmasi') {
        pendingApprovalCount++;
      }

      if (
        order.status === 'disetujui' ||
        order.status === 'diproses' ||
        order.status === 'dikirim' ||
        order.status === 'siap_pickup'
      ) {
        inProgressCount++;
      }

      // Aggregate selected 1-month period by WIB date
      const matchesSelectedPeriod =
        selectedMonth === 'last30'
          ? orderDateKey >= last30CutoffKey && orderDateKey <= todayKey
          : orderMonthKey === selectedMonth;

      if (matchesSelectedPeriod) {
        if (!dailyMap[orderDateKey]) {
          dailyMap[orderDateKey] = {
            date: orderDateKey,
            dateLabel: formatDateLabelFromKey(orderDateKey),
            ordersCount: 0,
            completedCount: 0,
            boxesCount: 0,
            qrisAmount: 0,
            codAmount: 0,
            totalOmzet: 0,
            settledOmzet: 0,
          };
        }
        const bucket = dailyMap[orderDateKey];
        bucket.ordersCount += 1;
        if (settled) {
          bucket.completedCount += 1;
          bucket.settledOmzet += amount;
        }
        bucket.boxesCount += boxes;
        bucket.totalOmzet += amount;
        if (order.paymentMethod === 'qris') bucket.qrisAmount += amount;
        if (order.paymentMethod === 'cod') bucket.codAmount += amount;
      }

      // Items & portion breakdown (safely handles both `productName` and legacy `name`)
      for (const item of order.items || []) {
        const qty = Number(item.quantity) || 1;
        const portion = Number(item.portion) || 0;
        if (portion > 0) {
          portionCounts[portion] = (portionCounts[portion] || 0) + qty;
        }
        const rawName = item.productName || (item as { name?: string }).name || 'Dimsum Mamifayy';
        const cleanName = String(rawName).trim() || 'Dimsum Mamifayy';
        productCounts[cleanName] = (productCounts[cleanName] || 0) + qty;
      }
    }

    const sortedProductCounts = Object.fromEntries(
      Object.entries(productCounts).sort(([, a], [, b]) => b - a)
    );

    const availableMonths = Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => ({ key, label: formatMonthLabel(key) }));

    const periodDateKeys = buildDateKeysForPeriod(selectedMonth, todayKey);
    const chartDays = periodDateKeys.map((dateKey) => {
      const bucket = dailyMap[dateKey];
      return {
        date: dateKey,
        shortLabel: dateKey.slice(8, 10),
        totalOmzet: bucket ? bucket.totalOmzet : 0,
        ordersCount: bucket ? bucket.ordersCount : 0,
      };
    });

    const dailyRows = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));

    const periodTotals = dailyRows.reduce(
      (acc, row) => {
        acc.totalOmzet += row.totalOmzet;
        acc.settledOmzet += row.settledOmzet;
        acc.ordersCount += row.ordersCount;
        acc.completedOrdersCount += row.completedCount;
        acc.totalBoxes += row.boxesCount;
        acc.qrisAmount += row.qrisAmount;
        acc.codAmount += row.codAmount;
        return acc;
      },
      {
        totalOmzet: 0,
        settledOmzet: 0,
        ordersCount: 0,
        completedOrdersCount: 0,
        totalBoxes: 0,
        qrisAmount: 0,
        codAmount: 0,
      }
    );

    const periodPendingOmzet = Math.max(0, periodTotals.totalOmzet - periodTotals.settledOmzet);
    const activeDaysCount = dailyRows.length;
    const denominatorDays = selectedMonth === 'last30' ? 30 : Math.max(1, periodDateKeys.length);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalOmzet,
          settledOmzet,
          pendingOmzet,
          todayOmzet,
          todaySettledOmzet,
          todayPendingOmzet,
          todayOrdersCount,
          todayCompletedCount,
          monthOmzet,
          monthOrdersCount,
          last30Omzet,
          last30OrdersCount,
          pendingApprovalCount,
          inProgressCount,
          totalCustomers: customers.length,
          dormantCustomersCount: customers.filter((c) => c.tag === 'lama_tidak_order').length,
          loyalCustomersCount: customers.filter((c) => c.tag === 'loyal').length,
          totalQrisAmount,
          totalCodAmount,
          settledQrisAmount,
          settledCodAmount,
          portionCounts,
          productCounts: sortedProductCounts,
          selectedMonth,
          availableMonths,
          monthlyReport: {
            periodLabel:
              selectedMonth === 'last30'
                ? '30 Hari Terakhir (1 Bulan)'
                : formatMonthLabel(selectedMonth),
            totalOmzet: periodTotals.totalOmzet,
            settledOmzet: periodTotals.settledOmzet,
            pendingOmzet: periodPendingOmzet,
            ordersCount: periodTotals.ordersCount,
            completedOrdersCount: periodTotals.completedOrdersCount,
            totalBoxes: periodTotals.totalBoxes,
            qrisAmount: periodTotals.qrisAmount,
            codAmount: periodTotals.codAmount,
            averageDailyOmzet: Math.round(periodTotals.totalOmzet / denominatorDays),
            averageOrderValue:
              periodTotals.ordersCount > 0
                ? Math.round(periodTotals.totalOmzet / periodTotals.ordersCount)
                : 0,
            activeDaysCount,
            chartDays,
            dailyRows,
          },
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error computing analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat analitik' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
