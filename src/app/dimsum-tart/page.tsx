'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Gift, 
  Flame, 
  Cake, 
  Check, 
  ShoppingBag, 
  Phone,
  Clock,
  Store,
  Share2
} from 'lucide-react';
import { formatRupiah, createWhatsAppUrl } from '@/lib/whatsapp';

interface TartProduct {
  id: string;
  name: string;
  badge?: string;
  category: 'tart' | 'platter';
  price: number;
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
    description: 'Pesta komplit aneka rasa terlengkap! Nikmati sensasi mentai, pangsit selimut, hingga pangsit goreng gurih.',
    contents: '6 pcs dimsum mentai + Pangsit Selimut + Dimsum Original 3 + Pangsit Goreng 3',
    image: '/images/products/platter-large.jpg',
    isPopular: true,
  },
];

export default function DimsumTartPage() {
  const [filter, setFilter] = useState<'all' | 'tart' | 'platter'>('all');
  const [selectedProduct, setSelectedProduct] = useState<TartProduct | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const filteredProducts = TART_PRODUCTS.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const handleOrderWhatsApp = (product: TartProduct) => {
    const text = `Halo Admin Dimsummentai Mamifayy! ❤️\n\nSaya ingin memesan menu spesial:\n🎂 *${product.name}*\n💰 Harga: ${formatRupiah(product.price)}\n📋 Rincian: ${product.contents}\n\nMohon info ketersediaan & jadwal pengantaran ya min. Terima kasih!`;
    const waUrl = createWhatsAppUrl('6281234567890', text);
    window.open(waUrl, '_blank');
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
                  Kue Ulang Tahun & Perayaan Spesial
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
              <span>Katalog Lengkap</span>
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
            Dibuat fresh setiap hari dengan saus mentai gurih ditorch harum melimpah. 
            Cocok untuk kejutan ulang tahun, anniversary, wisuda, hingga traktiran keluarga!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Ready Stock & Bisa Request Jam Antar</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Pickup Outlet: Kadungora Kp. Sindangsari</span>
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
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">Harga Spesial</span>
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
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:border-[#004AAD] text-slate-700 hover:text-[#004AAD] font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1"
                >
                  Lihat Rincian
                </button>
                <button
                  type="button"
                  onClick={() => handleOrderWhatsApp(product)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#004AAD] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Pesan Sekarang</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box Outlet & Custom Request */}
        <div className="mt-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#004AAD] font-black text-sm">
            <Heart className="w-4 h-4 fill-[#004AAD]" />
            <span>Catatan Pemesanan Dimsum Tart Mamifayy:</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
            <li>Bisa request kartu ucapan, lilin mini ulang tahun, & pita cantik (tulis di catatan).</li>
            <li>Pengiriman menggunakan <strong>Kurir Toko Mamifayy</strong> siap antar hangat sampai depan pintu.</li>
            <li>Bisa diambil sendiri langsung di outlet: <strong>Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07</strong>.</li>
            <li>Menerima pembayaran transfer <strong>QRIS BCA</strong> atau bayar tunai di tempat (<strong>COD</strong>).</li>
          </ul>
        </div>
      </main>

      {/* Modal Detail / Konfirmasi Pesanan */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-44 w-full">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 bg-[#004AAD] text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                {formatRupiah(selectedProduct.price)}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedProduct.description}</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 block mb-0.5">Rincian Paket:</span>
                <p className="text-xs font-semibold text-blue-950">{selectedProduct.contents}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Nama Pemesan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Kak Dinda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#004AAD]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Catatan / Tulisan Kartu Ucapan:</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Happy Birthday Sarah! Saus mentai jangan terlalu pedas ya min."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#004AAD]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Halo Admin Dimsummentai Mamifayy! ❤️\n\nSaya ingin memesan:\n🎂 *${selectedProduct.name}*\n💰 Total: ${formatRupiah(selectedProduct.price)}\n📋 Isi: ${selectedProduct.contents}\n${customerName ? `👤 Nama: ${customerName}\n` : ''}${customerNotes ? `📝 Catatan: ${customerNotes}\n` : ''}\nMohon info ketersediaan & jadwal pengantaran ya min. Terima kasih!`;
                    const waUrl = createWhatsAppUrl('6281234567890', text);
                    window.open(waUrl, '_blank');
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#004AAD] hover:bg-blue-800 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  Kirim ke WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
