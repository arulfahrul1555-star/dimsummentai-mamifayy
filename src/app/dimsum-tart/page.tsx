'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Gift, 
  Flame, 
  Cake, 
  Check, 
  ShoppingBag, 
  Clock, 
  Store, 
  Share2,
  Calendar,
  Bike,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { formatRupiah } from '@/lib/whatsapp';

interface TartProduct {
  id: string;
  name: string;
  badge?: string;
  category: 'tart' | 'platter';
  price: number;
  pcs: number;
  description: string;
  contents: string;
  image: string;
  isPopular?: boolean;
}

const TART_PRODUCTS: TartProduct[] = [
  {
    id: 'tart-1',
    name: 'PAKET TART 1',
    badge: 'Favorite Personal',
    category: 'tart',
    price: 40000,
    pcs: 8,
    description: 'Dimsum mentai hangat berhias pita cantik & lilin mini, cocok untuk kejutan manis teman & pasangan.',
    contents: '8 pcs dimsum mentai premium ditorch harum gurih',
    image: '/images/products/tart-1.jpg',
  },
  {
    id: 'tart-2',
    name: 'PAKET TART 2',
    badge: 'Best Seller',
    category: 'tart',
    price: 50000,
    pcs: 10,
    description: 'Pilihan terfavorit perayaan ulang tahun dengan lelehan saus mentai creamy melimpah.',
    contents: '10 pcs dimsum mentai spesial gurih & creamy',
    image: '/images/products/tart-2.jpg',
    isPopular: true,
  },
  {
    id: 'tart-3',
    name: 'PAKET TART 3',
    badge: 'Special Love Edition',
    category: 'tart',
    price: 60000,
    pcs: 10,
    description: 'Kreasi unik bentuk love eksklusif penuh cinta untuk hadiah anniversary & momen romantis.',
    contents: 'Mentai special love dengan susunan dimsum hati cantik',
    image: '/images/products/tart-3.jpg',
    isPopular: true,
  },
  {
    id: 'tart-4',
    name: 'PAKET TART 4',
    badge: 'Grand Party Box',
    category: 'tart',
    price: 80000,
    pcs: 16,
    description: 'Paket tart ukuran besar untuk pesta & kumpul keluarga lengkap dengan saus mentai melimpah.',
    contents: '16 pcs dimsum mentai porsi jumbo puas & mengenyangkan',
    image: '/images/products/tart-4.jpg',
  },
  {
    id: 'tart-5',
    name: 'PAKET TART 5',
    badge: 'Special Cake Masterpiece',
    category: 'tart',
    price: 75000,
    pcs: 14,
    description: 'Kue ulang tahun gurih kekinian pengganti kue tart manis biasa, bertingkat cantik dengan hiasan topper.',
    contents: 'Mentai special cake estetik & mewah siap rayakan hari spesial',
    image: '/images/products/tart-5.jpg',
    isPopular: true,
  },
  {
    id: 'platter-reguler',
    name: 'MIX PLATTER REGULER',
    badge: 'Cemilan Komplit',
    category: 'platter',
    price: 30000,
    pcs: 9,
    description: 'Paduan pas aneka dimsum kukus mentai, original, dan pangsit renyah untuk teman santai.',
    contents: 'Mentai isi 2 + Dimsum Original 3 + Pangsit Crispy 4',
    image: '/images/products/platter-reguler.jpg',
  },
  {
    id: 'platter-large',
    name: 'MIX PLATTER LARGE',
    badge: 'Pesta Rame-Rame',
    category: 'platter',
    price: 55000,
    pcs: 14,
    description: 'Pesta komplit aneka rasa terlengkap! Nikmati sensasi mentai, pangsit selimut, hingga pangsit goreng gurih.',
    contents: '6 pcs dimsum mentai + Pangsit Selimut + Dimsum Original 3 + Pangsit Goreng 3',
    image: '/images/products/platter-large.jpg',
    isPopular: true,
  },
];

export default function DimsumTartPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'tart' | 'platter'>('all');
  const [selectedProduct, setSelectedProduct] = useState<TartProduct | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Booking Form State
  const [qty, setQty] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'kurir_toko' | 'pickup'>('kurir_toko');
  const [customerAddress, setCustomerAddress] = useState('');
  const [greetingNotes, setGreetingNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cod'>('qris');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Default minimum date is today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredProducts = TART_PRODUCTS.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const openBookingModal = (product: TartProduct) => {
    setSelectedProduct(product);
    setQty(1);
    setErrorMessage('');
    // Default booking date to tomorrow or today if not set
    if (!bookingDate) {
      setBookingDate(todayStr);
    }
    if (!bookingTime) {
      setBookingTime('14:00');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Menu Dimsum Tart Mamifayy',
        text: 'Lihat daftar menu & harga Dimsum Tart & Mix Platter spesial Mamifayy!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Form Validation
    if (!bookingDate) {
      setErrorMessage('Silakan pilih tanggal booking pesanan.');
      return;
    }
    if (!bookingTime) {
      setErrorMessage('Silakan tentukan jam / waktu pengantaran.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Silakan isi nama pemesan.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Silakan isi nomor WhatsApp aktif untuk konfirmasi.');
      return;
    }
    if (deliveryType === 'kurir_toko' && !customerAddress.trim()) {
      setErrorMessage('Silakan isi alamat lengkap & patokan untuk kurir toko.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const formattedNotes = `📅 JADWAL BOOKING: ${bookingDate} Pukul ${bookingTime} WIB${
        greetingNotes.trim() ? ` | Ucapan/Lilin/Catatan: ${greetingNotes.trim()}` : ''
      }`;

      const finalAddress =
        deliveryType === 'pickup'
          ? 'Pickup Outlet: Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07'
          : customerAddress.trim();

      const itemSubtotal = selectedProduct.price * qty;

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: finalAddress,
        customerNotes: formattedNotes,
        deliveryType,
        deliveryFee: 0, // Admin will set delivery fee for kurir_toko
        paymentMethod,
        items: [
          {
            id: `${selectedProduct.id}-${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            portion: selectedProduct.pcs,
            topping: 'tart-special',
            toppingName: 'Dimsum Tart Spesial',
            unitPrice: selectedProduct.price,
            quantity: qty,
            subtotal: itemSubtotal,
            notes: selectedProduct.contents,
          },
        ],
        itemsTotal: itemSubtotal,
        discountAmount: 0,
        voucherCode: '',
        pointsUsed: 0,
        channel: 'website',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (resData.success && resData.data) {
        // Save order to browser localStorage for instant resilient tracking display
        try {
          localStorage.setItem(`mamifayy_order_${resData.data.id}`, JSON.stringify(resData.data));
          localStorage.setItem(`mamifayy_order_${resData.data.orderNumber}`, JSON.stringify(resData.data));
          localStorage.setItem('mamifayy_latest_order', JSON.stringify(resData.data));
        } catch (e) {}

        // Close modal and redirect directly to in-app live order tracking
        setSelectedProduct(null);
        router.push(`/order/${resData.data.id}`);
      } else {
        setErrorMessage(resData.message || 'Gagal menyimpan pesanan booking.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala jaringan saat mengirim pesanan booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-[#004AAD] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 flex items-center justify-center"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                <img src="/logo-square.png" alt="Logo Mamifayy" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5">
                  Menu Dimsum Tart Mamifayy
                  <Cake className="w-4 h-4 text-amber-300" />
                </h1>
                <p className="text-[11px] sm:text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Sistem Booking Tanggal & Jam Pengantaran
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition"
              title="Bagikan link menu"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isCopied ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-sm transition active:scale-95 flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Katalog Reguler</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#004AAD] via-[#0052be] to-blue-600 text-white px-4 pt-6 pb-10 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kue Ultah Gurih, Creamy & Mewah Pengganti Tart Biasa!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Price List Dimsum Tart & Mix Platter
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Dibuat fresh sesuai jadwal pesanan Kakak dengan saus mentai gurih ditorch harum melimpah. 
            Bisa pesan booking untuk tanggal & jam acara spesialmu langsung di web!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Sistem Booking Tanggal & Jam</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Pickup Outlet Kadungora / Kurir Toko</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-sky-300" />
              <span>Pesan Otomatis Masuk Sistem</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 -mt-5">
        {/* Category Filters */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-slate-100 flex items-center justify-center gap-1 sm:gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              filter === 'all'
                ? 'bg-[#004AAD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Menu ({TART_PRODUCTS.length})
          </button>
          <button
            onClick={() => setFilter('tart')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              filter === 'tart'
                ? 'bg-[#004AAD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cake className="w-4 h-4" />
            Paket Tart (5)
          </button>
          <button
            onClick={() => setFilter('platter')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              filter === 'platter'
                ? 'bg-[#004AAD] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            Mix Platter (2)
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Product Image Banner */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo-square.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-[#004AAD] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 border border-white/20">
                      {product.category === 'tart' ? (
                        <Cake className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>{product.badge}</span>
                    </div>
                  )}

                  {product.isPopular && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 uppercase tracking-wide">
                      <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
                      Terlaris
                    </div>
                  )}

                  {/* Price Tag in Hero Image */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">Harga Paket</span>
                    <span className="text-xl sm:text-2xl font-black drop-shadow-md">
                      {formatRupiah(product.price)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#004AAD] transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {product.description}
                    </p>
                  </div>

                  {/* Contents Pill Box */}
                  <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                      Isi Paket:
                    </div>
                    <p className="text-xs font-semibold text-blue-950">
                      {product.contents}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openBookingModal(product)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#004AAD] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Pesan & Booking Jadwal</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box Outlet & Custom Request */}
        <div className="mt-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#004AAD] font-black text-sm">
            <Heart className="w-4 h-4 fill-[#004AAD]" />
            <span>Sistem Booking Dimsum Tart & Mix Platter Mamifayy:</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li><strong>Sistem Booking Otomatis:</strong> Pilih tanggal dan jam pengantaran langsung di form pemesanan ini tanpa perlu dialihkan ke WhatsApp.</li>
            <li><strong>Live Tracking Pesanan:</strong> Setelah order terkirim, Kakak langsung mendapatkan Nomor Pesanan resmi dan halaman live tracking status pesanan.</li>
            <li><strong>Request Khusus:</strong> Bisa request tulisan kartu ucapan, lilin mini ulang tahun, & pita cantik di kolom catatan.</li>
            <li><strong>Pilihan Pengantaran:</strong> Menggunakan <strong>Kurir Toko Mamifayy</strong> siap antar hangat sampai rumah, atau <strong>Ambil Sendiri di Outlet</strong> (Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07).</li>
            <li><strong>Metode Pembayaran:</strong> Menerima transfer <strong>QRIS BCA</strong> atau bayar tunai di tempat (<strong>COD</strong>).</li>
          </ul>
        </div>
      </main>

      {/* Modal Form Booking In-App */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative h-36 sm:h-40 w-full shrink-0">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo-square.png';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/40 to-black/20"></div>
              
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition text-sm font-bold"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Form Booking Pesanan
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-white drop-shadow-sm">
                    {selectedProduct.name}
                  </h3>
                </div>
                <div className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-md">
                  {formatRupiah(selectedProduct.price)}
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {/* Product Contents Preview */}
              <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-blue-900 block">Rincian Paket:</span>
                  <p className="text-xs text-blue-950 font-medium">{selectedProduct.contents}</p>
                </div>
              </div>

              {/* Qty Selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    disabled={qty <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm text-slate-900 min-w-[20px] text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((prev) => prev + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Booking Date & Time Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                  <Calendar className="w-4 h-4 text-[#004AAD]" />
                  <span>Jadwal Booking Acara *</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tanggal Pengantaran / Ambil *
                    </label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-blue-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Jam / Waktu Pengantaran *
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-blue-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                    />
                  </div>
                </div>

                {/* Preset Time Chips */}
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1.5">
                    Pilihan Jam Cepat:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setBookingTime(time)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                          bookingTime === time
                            ? 'bg-[#004AAD] text-white shadow-xs'
                            : 'bg-white border border-blue-200 text-blue-900 hover:bg-blue-100/50'
                        }`}
                      >
                        {time} WIB
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kak Dinda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Nomor ini digunakan untuk update status pesanan & posisi kurir.
                  </p>
                </div>
              </div>

              {/* Delivery Type Option */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Metode Pengantaran *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('kurir_toko')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      deliveryType === 'kurir_toko'
                        ? 'border-[#004AAD] bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bike className="w-4 h-4 mb-1 text-[#004AAD]" />
                    <div>
                      <span className="text-xs block">🛵 Kurir Toko</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Ongkir dihitung admin
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      deliveryType === 'pickup'
                        ? 'border-[#004AAD] bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 mb-1 text-[#004AAD]" />
                    <div>
                      <span className="text-xs block">🏪 Ambil Sendiri</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Pickup di Outlet
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Address Field if Kurir Toko vs Pickup Details */}
              {deliveryType === 'kurir_toko' ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Alamat Lengkap & Patokan Pengantaran *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Jl. Ahmad Yani No. 12, RT 02/05, pagar hitam samping apotek"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    ℹ️ Ongkir kurir toko akan dihitung adil oleh admin saat menyetujui jadwal booking Kakak.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
                  <span className="text-xs font-bold text-blue-900 block">
                    📍 Lokasi Pengambilan Outlet (Bebas Ongkir):
                  </span>
                  <p className="text-xs text-slate-800 font-semibold">
                    Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pesanan tart akan disiapkan fresh dan ditorch sebelum jam pengambilan.
                  </p>
                </div>
              )}

              {/* Custom Greetings / Candle Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tulisan Kartu Ucapan / Lilin Ulang Tahun (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tulisan di topper: 'Happy 24th Birthday Sarah!', request lilin angka 24, saus mentai jangan pedas."
                  value={greetingNotes}
                  onChange={(e) => setGreetingNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Metode Pembayaran *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      paymentMethod === 'qris'
                        ? 'border-[#004AAD] bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#004AAD] shrink-0" />
                    <div>
                      <span className="text-xs block">QRIS / Transfer</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        BCA / Semua Bank
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      paymentMethod === 'cod'
                        ? 'border-[#004AAD] bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs block">Bayar di Tempat</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        COD Tunai
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-100 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal ({qty} Box):</span>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(selectedProduct.price * qty)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Ongkir Kurir:</span>
                  <span className="font-semibold text-blue-700">
                    {deliveryType === 'pickup' ? 'Rp 0 (Pickup)' : 'Dihitung admin saat konfirmasi'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900">
                  <span className="font-black text-xs">Total Pembayaran Produk:</span>
                  <span className="font-black text-sm text-[#004AAD]">
                    {formatRupiah(selectedProduct.price * qty)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 rounded-xl bg-[#004AAD] hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>Konfirmasi & Booking Pesanan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
