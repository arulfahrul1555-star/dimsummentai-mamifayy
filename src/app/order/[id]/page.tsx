'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Phone,
  Flame,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah, createWhatsAppUrl } from '@/lib/whatsapp';

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Resilient Instant Local Storage Hydration
  useEffect(() => {
    try {
      const cached =
        localStorage.getItem(`mamifayy_order_${id}`) ||
        localStorage.getItem('mamifayy_latest_order');
      if (cached) {
        const parsed: Order = JSON.parse(cached);
        if (parsed && (parsed.id === id || parsed.orderNumber === id || !id)) {
          setOrder(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
        try {
          localStorage.setItem(`mamifayy_order_${data.data.id}`, JSON.stringify(data.data));
          localStorage.setItem(`mamifayy_order_${data.data.orderNumber}`, JSON.stringify(data.data));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching order', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto polling every 8 seconds for live updates
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    const waHelpUrl = createWhatsAppUrl(
      '6281234567890',
      `Halo Admin Dimsummentai Mamifayy! Saya baru saja memesan via website dengan nomor/ID pesanan: *${id}*, mohon bantuannya untuk pengecekan status pesanan saya ya Kak. Terima kasih!`
    );

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Sedang Menghubungkan Pesanan</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Data pesanan dengan kode <code className="bg-slate-100 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[11px]">{id}</code> sedang disinkronkan ke server.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchOrder();
              }}
              className="w-full bg-[#004AAD] hover:bg-blue-800 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Muat Ulang Status Pesanan</span>
            </button>

            <a
              href={waHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp Admin</span>
            </a>

            <Link
              href="/"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition mt-1"
            >
              Kembali ke Halaman Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case 'menunggu_konfirmasi':
        return 1;
      case 'disetujui':
      case 'diproses':
        return 2;
      case 'dikirim':
      case 'siap_pickup':
        return 3;
      case 'selesai':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep();

  // WhatsApp message from customer to admin to confirm order
  const waCustomerText = `Halo Admin Dimsummentai Mamifayy! Saya baru saja membuat pesanan dengan nomor *${order.orderNumber}* atas nama *${order.customerName}*. Mohon dicek dan dikonfirmasi ya, terima kasih! 🙏`;
  const waUrl = createWhatsAppUrl('6281234567890', waCustomerText);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pesan Lagi</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/80 shrink-0 bg-white shadow-xs">
              <img src="/logo-square.png" alt="Dimsummentai Mamifayy" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold bg-blue-800/80 px-3 py-1 rounded-full border border-blue-500/40">
              {order.orderNumber}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Status Pesanan Kamu
              </span>
              <h2 className="text-lg font-black text-slate-900 capitalize">
                {order.status === 'menunggu_konfirmasi' && 'Menunggu Konfirmasi Admin 🟡'}
                {order.status === 'disetujui' && 'Pesanan Disetujui 🟢'}
                {order.status === 'diproses' && 'Sedang Ditorch & Disiapkan 🔥'}
                {order.status === 'dikirim' && 'Sedang Diantar Kurir Toko 🛵💨'}
                {order.status === 'siap_pickup' && 'Siap Diambil di Outlet 🥡'}
                {order.status === 'selesai' && 'Pesanan Selesai ❤️'}
                {order.status === 'dibatalkan' && 'Pesanan Dibatalkan ❌'}
              </h2>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                fetchOrder();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Perbarui Status"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="relative flex justify-between items-center mb-6 px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1">Dipesan</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1">Dapur / Torch</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1">
                {order.deliveryType === 'kurir_toko' ? 'Diantar' : 'Siap Ambil'}
              </span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                4
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1">Selesai</span>
            </div>
          </div>

          {/* Status Message Alert */}
          {order.status === 'menunggu_konfirmasi' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-bold mb-0.5">Pesanan sedang menunggu konfirmasi admin.</p>
              <p>
                {order.deliveryType === 'kurir_toko'
                  ? 'Admin sedang mengecek jarak alamat pengiriman Anda untuk menghitung nominal ongkir yang pas. Halaman ini akan terupdate otomatis.'
                  : 'Admin sedang mengonfirmasi ketersediaan porsi di outlet.'}
              </p>
            </div>
          )}

          {order.status === 'diproses' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold">Pesanan sedang ditorch hangat!</p>
                <p>Saus mentai dan keju sedang disiapkan fresh di dapur Mamifayy.</p>
              </div>
            </div>
          )}

          {order.status === 'dikirim' && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800 flex items-center gap-2">
              <Bike className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <p className="font-bold">Kurir toko sedang di jalan menuju alamat Anda!</p>
                <p>Tujuan: {order.customerAddress}</p>
              </div>
            </div>
          )}

          {order.status === 'siap_pickup' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-emerald-950">Pesanan Siap Diambil di Outlet!</p>
                  <p className="text-[11px] text-emerald-700">Tunjukkan nomor pesanan <strong>#{order.orderNumber}</strong> ke kasir.</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Alamat Pengambilan:</span>
                <p className="font-bold text-slate-900">📍 Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07</p>
              </div>
            </div>
          )}

          {/* Direct WhatsApp to Admin */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>Chat WhatsApp Admin Toko</span>
            </a>
          </div>
        </div>

        {/* Payment Details & QRIS Card */}
        {order.paymentMethod === 'qris' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Informasi Pembayaran QRIS / Transfer
              </h3>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center">
                <QrCode className="w-24 h-24 text-slate-800" />
                <span className="text-[10px] font-bold text-blue-600">QRIS NASIONAL</span>
              </div>

              <div className="text-xs space-y-1.5 flex-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nama Merchant:</span>
                  <span className="font-extrabold text-slate-900 text-sm">DIMSUMMENTAI MAMIFAYY</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Bank / E-Wallet:</span>
                  <span className="font-semibold text-slate-800">
                    BCA: 8820-1928-392 (a.n Mamifayy)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nominal Transfer:</span>
                  <span className="font-extrabold text-blue-700 text-base">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  * Setelah transfer, mohon kirimkan bukti transfer melalui chat WhatsApp admin ya Kak.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-bold text-sm text-slate-800 mb-3">Rincian Menu</h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold text-slate-800">{item.productName}</p>
                  <p className="text-[11px] text-blue-600 font-semibold">
                    Isi {item.portion} pcs • {item.toppingName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.quantity}x @ {formatRupiah(item.unitPrice)}
                  </p>
                </div>
                <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Menu:</span>
              <span className="font-semibold">{formatRupiah(order.itemsTotal)}</span>
            </div>

            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <span>🎟️ Voucher Diskon ({order.pointsUsed || 0} Poin):</span>
                <span>-{formatRupiah(order.discountAmount)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-slate-600">
              <span>Ongkir Kurir Toko:</span>
              <span className="font-semibold text-blue-700">
                {order.deliveryType === 'pickup'
                  ? 'Rp 0 (Pickup)'
                  : order.deliveryFee > 0
                  ? formatRupiah(order.deliveryFee)
                  : 'Menunggu hitungan admin'}
              </span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Tagihan:</span>
              <span className="text-blue-700">{formatRupiah(order.totalAmount)}</span>
            </div>

            {order.pointsEarned ? (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Pesanan ini memberikan <strong>+{order.pointsEarned} Poin Loyalty</strong> ke nomor WhatsApp kamu!
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Customer & Delivery Data */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-xs space-y-2">
          <h3 className="font-bold text-sm text-slate-800 mb-2">Data Pemesan</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama:</span>
              <span className="font-semibold text-slate-800">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">WhatsApp:</span>
              <span className="font-semibold text-slate-800">{order.customerPhone}</span>
            </div>
          </div>

          {order.deliveryType === 'kurir_toko' ? (
            <div>
              <span className="text-slate-400 block text-[11px]">Alamat Pengiriman (Kurir Toko):</span>
              <span className="font-medium text-slate-800">{order.customerAddress || '-'}</span>
            </div>
          ) : (
            <div>
              <span className="text-slate-400 block text-[11px]">Alamat Pengambilan (Pickup di Outlet):</span>
              <span className="font-bold text-slate-900 block">📍 Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07</span>
            </div>
          )}

          {order.customerNotes && (
            <div className={`p-3 rounded-xl border ${
              order.customerNotes.includes('BOOKING') || order.customerNotes.includes('Booking')
                ? 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 mb-1">
                {order.customerNotes.includes('BOOKING') || order.customerNotes.includes('Booking') ? (
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{order.customerNotes.includes('BOOKING') || order.customerNotes.includes('Booking') ? 'Jadwal Booking & Catatan Acara:' : 'Catatan Khusus:'}</span>
              </div>
              <p className="font-medium text-xs leading-relaxed">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
