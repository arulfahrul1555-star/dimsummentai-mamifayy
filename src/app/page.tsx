'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Phone,
  ShieldCheck,
  X,
  CreditCard,
  Banknote,
  Bike,
  Store,
  Gift,
  Tag,
  Award,
  Star,
  User,
  Lock,
  Check,
  Calendar,
  Cake,
} from 'lucide-react';
import { Product, PortionOption, ToppingOption, DeliveryType, PaymentMethod } from '@/types';
import { formatRupiah } from '@/lib/whatsapp';

export default function PublicMenuPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Customer Account & OTP Auth States
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPhone, setAuthPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authNameOptional, setAuthNameOptional] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Points Exchange Hub Modal
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  // Loyalty & Voucher states
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    title: string;
    discountPercent?: number;
    discount: number;
    pointsCost: number;
    freeItem?: boolean;
  } | null>(null);

  // Selected config for each product card: { [productId]: { portion: PortionOption, topping: ToppingOption, qty: number } }
  const [selections, setSelections] = useState<
    Record<
      string,
      {
        portion: PortionOption;
        topping: ToppingOption;
        qty: number;
      }
    >
  >({});

  // Cart state
  const [cart, setCart] = useState<
    Array<{
      id: string;
      productId: string;
      productName: string;
      portion: number;
      topping: string;
      toppingName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>
  >([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('kurir_toko');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.products) {
          setProducts(data.data.products);
          // Initialize selections
          const initSel: Record<string, any> = {};
          data.data.products.forEach((p: Product) => {
            initSel[p.id] = {
              portion: p.portions[0],
              topping: (p.allowedToppings && p.allowedToppings.length > 0) ? p.allowedToppings[0] : null,
              qty: 1,
            };
          });
          setSelections(initSel);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePortionSelect = (productId: string, portion: PortionOption) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        portion,
      },
    }));
  };

  const handleToppingSelect = (productId: string, topping: ToppingOption) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        topping,
      },
    }));
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setSelections((prev) => {
      const currentQty = prev[productId]?.qty || 1;
      const nextQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          qty: nextQty,
        },
      };
    });
  };

  const addToCart = (product: Product) => {
    const sel = selections[product.id];
    if (!sel) return;

    const toppingPrice = sel.topping ? sel.topping.price : 0;
    const unitPrice = sel.portion.price + toppingPrice;
    const subtotal = unitPrice * sel.qty;
    const cartItemId = sel.topping
      ? `${product.id}-${sel.portion.pcs}-${sel.topping.id}`
      : `${product.id}-${sel.portion.pcs}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + sel.qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            portion: sel.portion.pcs,
            topping: sel.topping ? sel.topping.id : '',
            toppingName: sel.topping ? sel.topping.name : '',
            unitPrice,
            quantity: sel.qty,
            subtotal,
          },
        ];
      }
    });

    // Reset quantity back to 1
    setSelections((prev) => ({
      ...prev,
      [product.id]: {
        ...prev[product.id],
        qty: 1,
      },
    }));

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const hasTartItem = cart.some(
    (item) =>
      item.productId.startsWith('tart-') ||
      item.productId.startsWith('platter-') ||
      products.find((p) => p.id === item.productId)?.category === 'Dimsum Tart'
  );

  // Dynamic discount calculation (supports percentage or fixed)
  const discountAmount = appliedVoucher
    ? appliedVoucher.discountPercent
      ? Math.round(cartSubtotal * (appliedVoucher.discountPercent / 100))
      : appliedVoucher.discount
    : 0;

  const finalSubtotal = Math.max(0, cartSubtotal - discountAmount);

  // Load customer session on mount
  useEffect(() => {
    const saved = localStorage.getItem('mamifayy_customer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomerUser(parsed);
        setCustomerName(parsed.name || '');
        if (parsed.phone) setCustomerPhone(parsed.phone);
      } catch (e) {}
    }
  }, []);

  // Send OTP to customer's phone number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone.trim() || authPhone.trim().length < 8) {
      setAuthError('Masukkan nomor HP / WhatsApp yang valid (minimal 8 digit)');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authPhone.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOtpSent(true);
        setDemoOtpCode(data.data.otpCode);
        setAuthOtp(data.data.otpCode); // Pre-fill for instant seamless test
      } else {
        setAuthError(data.message || 'Gagal mengirim kode OTP');
      }
    } catch {
      setAuthError('Kendala jaringan saat mengirim OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp.trim()) {
      setAuthError('Masukkan 4 digit kode OTP');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: authPhone.trim(),
          otp: authOtp.trim(),
          name: authNameOptional.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCustomerUser(data.data);
        setCustomerName(data.data.name);
        setCustomerPhone(data.data.phone || authPhone.trim());
        localStorage.setItem('mamifayy_customer', JSON.stringify(data.data));
        setIsAuthModalOpen(false);
        setOtpSent(false);
        setAuthOtp('');
        setDemoOtpCode(null);
      } else {
        setAuthError(data.message || 'Kode OTP salah! Silakan coba lagi.');
      }
    } catch {
      setAuthError('Kendala jaringan saat verifikasi OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    setAppliedVoucher(null);
    localStorage.removeItem('mamifayy_customer');
  };

  // Redeem Reward (100 pts -> 10% off, 200 pts -> 20% off, 250 pts -> Dimsum Original 5 pcs)
  const handleRedeemReward = async (
    rewardType: 'voucher_10' | 'voucher_20' | 'dimsum_original_5'
  ) => {
    if (!customerUser) {
      setIsRedeemModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    setRedeemLoading(rewardType);
    setRedeemSuccessMsg('');

    try {
      const res = await fetch('/api/customers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerUser.id, rewardType }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...customerUser, points: data.data.remainingPoints };
        setCustomerUser(updatedUser);
        localStorage.setItem('mamifayy_customer', JSON.stringify(updatedUser));

        if (rewardType === 'voucher_10') {
          setAppliedVoucher({
            code: 'DISKON10',
            title: 'Voucher Diskon 10%',
            discountPercent: 10,
            discount: Math.round(cartSubtotal * 0.1),
            pointsCost: 100,
          });
          setRedeemSuccessMsg(
            '🎉 Sukses menukar 100 Poin untuk Diskon 10%! Kupon otomatis terpasang.'
          );
        } else if (rewardType === 'voucher_20') {
          setAppliedVoucher({
            code: 'DISKON20',
            title: 'Voucher Diskon 20%',
            discountPercent: 20,
            discount: Math.round(cartSubtotal * 0.2),
            pointsCost: 200,
          });
          setRedeemSuccessMsg(
            '🎉 Sukses menukar 200 Poin untuk Diskon 20%! Kupon otomatis terpasang.'
          );
        } else if (rewardType === 'dimsum_original_5') {
          const freeItemId = `free-dimsum-${Date.now()}`;
          setCart((prev) => [
            ...prev,
            {
              id: freeItemId,
              productId: 'prod-ayam',
              productName: '🎁 Hadiah Poin: Dimsum Original (5 pcs)',
              portion: 5,
              topping: 'original',
              toppingName: 'Original Steam',
              unitPrice: 0,
              quantity: 1,
              subtotal: 0,
            },
          ]);
          setAppliedVoucher({
            code: 'GRATISDIMSUM5',
            title: 'Gratis Dimsum Original 5 pcs',
            discount: 0,
            pointsCost: 250,
            freeItem: true,
          });
          setRedeemSuccessMsg(
            '🥟 Sukses menukar 250 Poin! 1 Box Dimsum Original Isi 5 pcs (Rp 0) sudah masuk ke keranjang pesanan Kakak!'
          );
        }
      } else {
        alert(data.message || 'Gagal menukarkan poin');
      }
    } catch {
      alert('Kendala jaringan saat menukar poin');
    } finally {
      setRedeemLoading(null);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Mohon isi Nama dan Nomor WhatsApp aktif Kak!');
      return;
    }
    if (hasTartItem && (!bookingDate || !bookingTime)) {
      alert('Pesanan Kakak berisi paket Dimsum Tart/Mix Platter. Harap pilih Tanggal dan Jam Booking pengantaran!');
      return;
    }
    if (deliveryType === 'kurir_toko' && !customerAddress.trim()) {
      alert('Mohon masukkan Alamat Pengiriman lengkap untuk Kurir Toko!');
      return;
    }

    setSubmitting(true);
    try {
      const finalCustomerNotes = hasTartItem
        ? `📅 JADWAL BOOKING: ${bookingDate} Pukul ${bookingTime} WIB${customerNotes ? ` | ${customerNotes}` : ''}`
        : customerNotes;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress:
            deliveryType === 'pickup'
              ? 'Pickup Outlet: Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07'
              : customerAddress,
          customerNotes: finalCustomerNotes,
          deliveryType,
          deliveryFee: 0, // Admin will set this during approval
          paymentMethod,
          items: cart,
          itemsTotal: cartSubtotal,
          discountAmount,
          voucherCode: appliedVoucher?.code || '',
          pointsUsed: appliedVoucher?.pointsCost || 0,
          channel: 'website',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Save order to browser localStorage for instant resilient tracking display
        try {
          localStorage.setItem(`mamifayy_order_${data.data.id}`, JSON.stringify(data.data));
          localStorage.setItem(`mamifayy_order_${data.data.orderNumber}`, JSON.stringify(data.data));
          localStorage.setItem('mamifayy_latest_order', JSON.stringify(data.data));
        } catch (e) {}

        // Clear cart
        setCart([]);
        setAppliedVoucher(null);
        setIsCartOpen(false);
        // Redirect to live order tracking
        router.push(`/order/${data.data.id}`);
      } else {
        alert(data.message || 'Gagal mengirim pesanan');
      }
    } catch (err) {
      alert('Terjadi kendala jaringan saat mengirim pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Semua', 'Signature', 'Dimsum Tart', 'Klasik', 'Favorit', 'Gorengan'];
  const filteredProducts =
    selectedCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-blue-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/90 shadow-md shrink-0 bg-white">
              <img src="/logo-square.png" alt="Dimsummentai Mamifayy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight flex items-center gap-1.5">
                Dimsummentai Mamifayy
                <Sparkles className="w-4 h-4 text-sky-300" />
              </h1>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Ready Stock Setiap Hari • 10.00 - 21.00 WIB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customerUser ? (
              <div className="flex items-center gap-1.5">
                {/* Points Display at Top Header! */}
                <button
                  type="button"
                  onClick={() => setIsRedeemModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95"
                  title="Klik untuk menukar poin"
                >
                  <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span className="font-black text-xs sm:text-sm">{customerUser.points ?? 0}</span>
                  <span className="hidden sm:inline text-xs font-bold">Poin</span>
                  <span className="bg-slate-900 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    Tukar 🎁
                  </span>
                </button>

                {/* Profile Name & Logout */}
                <div className="flex items-center gap-1 bg-blue-800/90 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs border border-blue-500/40">
                  <span className="font-semibold text-blue-100 max-w-[80px] sm:max-w-[120px] truncate">
                    👤 {customerUser.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleCustomerLogout}
                    className="text-blue-300 hover:text-white font-bold ml-1 text-xs px-1"
                    title="Keluar Akun Member"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk Member</span>
              </button>
            )}

            <Link
              href="/admin/login"
              className="text-xs bg-blue-800/80 hover:bg-blue-900 text-white font-medium px-2.5 py-1.5 rounded-xl border border-blue-500/40 transition flex items-center gap-1 shrink-0"
              title="Panel Khusus Admin Toko"
            >
              <span>🔐 Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 text-white px-4 pt-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/90 shadow-xl shrink-0 bg-white">
                <img src="/logo-square.png" alt="Logo Dimsummentai Mamifayy" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/50 text-xs font-semibold mb-2 border border-blue-400/30">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  Ditorch Hangat Sesuai Pesanan
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-1.5 leading-snug">
                  Dimsum Mentai Gurih, Creamy & Keju Melting Lumer! 🔥
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                  Perpaduan sempurna antara dimsum kukus buatan rumahan yang lembut dengan saus mentai creamy yang kaya rasa. Ditorch langsung saat pesanan masuk!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs font-medium">
              <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-xl">
                <Bike className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Kurir Toko Siap Antar</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-xl">
                <Banknote className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Bisa Bayar COD / QRIS</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>100% Halal & Daging Padat</span>
              </div>
            </div>

            {/* Loyalty Program Promo Card */}
            <div
              onClick={() => {
                if (customerUser) setIsRedeemModalOpen(true);
                else setIsAuthModalOpen(true);
              }}
              className="mt-4 cursor-pointer bg-gradient-to-r from-amber-500/25 to-orange-500/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-300/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs transition shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 font-black flex items-center justify-center shrink-0 shadow-sm">
                  <Gift className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <span className="font-extrabold text-amber-200 block text-xs sm:text-sm">
                    Pusat Hadiah & Penukaran Poin Member ⭐
                  </span>
                  <span className="text-[11px] text-blue-100 block mt-0.5">
                    • <strong>100 Poin:</strong> Diskon 10% &nbsp;|&nbsp; • <strong>200 Poin:</strong> Diskon 20% &nbsp;|&nbsp; • <strong>250 Poin:</strong> Gratis Dimsum Original Isi 5!
                  </span>
                </div>
              </div>
              <span className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-xl shrink-0 shadow-sm">
                Tukar Poin 🎁
              </span>
            </div>

            {/* Special Banner: Menu Dimsum Tart Mamifayy */}
            <Link
              href="/dimsum-tart"
              className="mt-3 block bg-gradient-to-r from-blue-900/90 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-white/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm text-lg">
                    🎂
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Menu Baru
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1">
                        Menu Dimsum Tart Mamifayy
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5 line-clamp-1">
                      Paket Tart 1-5 & Mix Platter spesial perayaan mulai Rp 30.000!
                    </p>
                  </div>
                </div>
                <span className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 border border-white/20">
                  Lihat Menu ➔
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 -mt-6">
        {/* Category Pills */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/80 mb-6 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 font-medium">Menyiapkan menu segar Mamifayy...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProducts.map((product) => {
              const hasToppings = product.allowedToppings && product.allowedToppings.length > 0;
              const currentSel = selections[product.id] || {
                portion: product.portions[0],
                topping: hasToppings ? product.allowedToppings[0] : null,
                qty: 1,
              };

              const currentUnitPrice =
                (currentSel.portion?.price || 0) + (currentSel.topping?.price || 0);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* Image & Badge */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-blue-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {product.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Portion Selector Pills */}
                      <div className="mt-4">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          {hasToppings ? '1. Pilih Ukuran Porsi (Box):' : 'Pilih Ukuran Porsi (Box):'}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {product.portions.map((portion) => (
                            <button
                              key={portion.pcs}
                              type="button"
                              onClick={() => handlePortionSelect(product.id, portion)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                currentSel.portion?.pcs === portion.pcs
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Isi {portion.pcs} ({formatRupiah(portion.price)})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Topping Selector Pills (Only for Dimsum Mentai) */}
                      {hasToppings && (
                        <div className="mt-3">
                          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            2. Pilihan Topping Mentai:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {product.allowedToppings.map((topping) => (
                              <button
                                key={topping.id}
                                type="button"
                                onClick={() => handleToppingSelect(product.id, topping)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  currentSel.topping?.id === topping.id
                                    ? 'bg-blue-800 border-blue-800 text-white shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {topping.name}
                                {topping.price > 0 && ` (+${formatRupiah(topping.price)})`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Price & Add Action */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Harga per Box
                        </span>
                        <span className="text-base font-extrabold text-blue-700">
                          {formatRupiah(currentUnitPrice)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Qty Selector */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {currentSel.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Bar at Bottom */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl shadow-xl border border-blue-400/40 flex items-center justify-between transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-700 font-extrabold flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </div>
              <div className="text-left">
                <span className="text-[11px] text-blue-100 font-medium block">
                  Keranjang Pesanan
                </span>
                <span className="text-sm font-extrabold">{formatRupiah(cartSubtotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3.5 py-2 rounded-xl">
              <span>Lanjut Pesan</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-base">Keranjang & Pembayaran</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Order Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Pesanan Kamu ({cartItemsCount} Box)
                </h4>
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    Keranjang masih kosong nih Kak.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.productName}
                          </h5>
                          <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                            Isi {item.portion} pcs{item.toppingName ? ` • ${item.toppingName}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.quantity}x @ {formatRupiah(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs font-extrabold text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 font-medium mt-2"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Input Pelanggan */}
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
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
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Untuk konfirmasi pesanan dan info posisi kurir toko.
                  </p>
                </div>

                {/* Tart Booking Schedule (Only shown if cart has Dimsum Tart items) */}
                {hasTartItem && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>Jadwal Booking Dimsum Tart *</span>
                    </div>
                    <p className="text-[11px] text-blue-900 leading-tight">
                      Pesanan mengandung paket Dimsum Tart / Mix Platter. Tentukan tanggal & waktu acara Kakak:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">
                          Tanggal Booking *
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-blue-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">
                          Jam / Waktu *
                        </label>
                        <input
                          type="time"
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-blue-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setBookingTime(time)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                            bookingTime === time
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/50'
                          }`}
                        >
                          {time} WIB
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Account & Points Reward in Checkout */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                  {customerUser ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-slate-900">
                            Member: Kak {customerUser.name}
                          </span>
                        </div>
                        <span className="bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          {customerUser.points ?? 0} Poin
                        </span>
                      </div>

                      {appliedVoucher ? (
                        <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-700" />
                            <div>
                              <span className="font-bold block">{appliedVoucher.title}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {appliedVoucher.freeItem ? 'Gratis 1 box dimsum original di keranjang' : `Potongan ${formatRupiah(discountAmount)}`}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeVoucher}
                            className="text-xs font-bold text-red-600 hover:underline bg-white/70 px-2 py-1 rounded-lg"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-600">Mau pakai voucher diskon?</span>
                          <button
                            type="button"
                            onClick={() => setIsRedeemModalOpen(true)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition"
                          >
                            Tukar Poin Diskon 🎁
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Punya Poin Loyalty?</span>
                        <span className="text-[11px] text-slate-500">Masuk akun untuk tukar voucher diskon 10%, 20%, atau dimsum gratis.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shrink-0"
                      >
                        Masuk Member
                      </button>
                    </div>
                  )}
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
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Bike className="w-4 h-4 mb-1 text-blue-600" />
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
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 mb-1 text-blue-600" />
                      <div>
                        <span className="text-xs block">🏪 Ambil Sendiri</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Pickup di Outlet
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address (If Kurir Toko) vs Outlet Pickup Address */}
                {deliveryType === 'kurir_toko' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Alamat Lengkap & Patokan Rumah *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan (misal: cat pagar abu-abu depan masjid)"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1.5 text-[11px] text-amber-800">
                      ℹ️ <strong>Catatan Kurir Toko:</strong> Nominal ongkir akan dihitung adil oleh admin sesuai jarak saat konfirmasi pesanan.
                    </div>
                  </div>
                ) : (
                  /* Outlet Pickup Address Card */
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3.5 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-blue-950 block">
                            Lokasi Pengambilan Outlet:
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full inline-block">
                            ✓ Bebas Ongkir (Gratis)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        📍 Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Pesanan akan disiapkan fresh dan ditorch hangat untuk Kakak. Tunjukkan nomor pesanan ke kasir saat tiba di outlet.
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Torch agak gosong sedikit ya min"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-xs block">QRIS / Transfer</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Scan barcode
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs block">COD (Bayar Tunai)</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Bayar ke kurir
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Subtotal Makanan:</span>
                <span className="font-bold text-slate-900">{formatRupiah(cartSubtotal)}</span>
              </div>

              {appliedVoucher && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <span>🎟️ Voucher Diskon ({appliedVoucher.pointsCost} Poin):</span>
                  <span>-{formatRupiah(appliedVoucher.discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Ongkir Kurir Toko:</span>
                <span className="text-blue-700 font-semibold">
                  {deliveryType === 'pickup' ? 'Rp 0 (Pickup)' : 'Dihitung saat konfirmasi'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200 mb-3">
                <span>Total Makanan:</span>
                <span className="text-blue-700">{formatRupiah(finalSubtotal)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={submitting || cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengirim Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Kirim Pesanan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Login / Register Modal via Phone + OTP */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-blue-100 relative">
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                setOtpSent(false);
                setAuthError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 shadow-md mx-auto mb-2 bg-white">
                <img src="/logo-square.png" alt="Dimsummentai Mamifayy" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {otpSent ? 'Masukkan Kode OTP 🔐' : 'Masuk via Nomor WhatsApp 📱'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {otpSent
                  ? `Kode OTP 4-digit telah dikirim ke nomor ${authPhone}`
                  : 'Cukup masukkan nomor HP untuk masuk dan cek poin!'}
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 mb-3">
                {authError}
              </div>
            )}

            {!otpSent ? (
              /* Step 1: Input Nomor HP */
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp / No HP *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      autoFocus
                      placeholder="Contoh: 081298765432"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-blue-600 mt-1">
                    ✨ Nomor baru otomatis terdaftar & dapat <strong>100 Poin</strong> selamat datang!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Kirim Kode OTP 📲</span>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Input OTP Verification */
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                {/* Simulated OTP Notification Banner */}
                {demoOtpCode && (
                  <div
                    onClick={() => setAuthOtp(demoOtpCode)}
                    className="cursor-pointer bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs text-emerald-900 transition hover:bg-emerald-100"
                  >
                    <span className="block text-[11px] font-medium text-emerald-700">
                      💬 Notifikasi OTP WhatsApp:
                    </span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-black text-sm text-emerald-800 tracking-widest">
                        {demoOtpCode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded">
                        Klik Isi Otomatis
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kode OTP 4-Digit *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    autoFocus
                    placeholder="• • • •"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full text-center text-lg tracking-widest font-mono font-black py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Panggilan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Siti Rahma"
                    value={authNameOptional}
                    onChange={(e) => setAuthNameOptional(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Verifikasi & Masuk Member ⭐</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-blue-600 hover:underline font-bold text-[11px]"
                  >
                    ← Ganti No. HP
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-slate-500 hover:text-slate-800 text-[11px]"
                  >
                    Kirim Ulang OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Points Exchange Hub Modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsRedeemModalOpen(false);
                setRedeemSuccessMsg('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-md">
                <Star className="w-7 h-7 fill-slate-950 text-slate-950" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Pusat Penukaran Poin</h3>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-950 font-black px-3 py-1 rounded-full text-xs mt-1">
                <span>Saldo Poin Anda:</span>
                <span className="text-sm font-black text-amber-700">
                  {customerUser?.points ?? 0} Poin
                </span>
              </div>
            </div>

            {redeemSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-2xl border border-emerald-200 mb-4 font-semibold text-center">
                {redeemSuccessMsg}
              </div>
            )}

            <div className="space-y-3">
              {/* Reward 1: 100 Pts -> Diskon 10% */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Voucher Diskon 10%
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Potongan 10% dari total pesanan makanan Anda.
                  </p>
                  <span className="inline-block text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md mt-1">
                    Butuh 100 Poin
                  </span>
                </div>

                <button
                  type="button"
                  disabled={redeemLoading !== null || (customerUser?.points ?? 0) < 100}
                  onClick={() => handleRedeemReward('voucher_10')}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-sm transition active:scale-95 shrink-0"
                >
                  {redeemLoading === 'voucher_10'
                    ? 'Menukar...'
                    : (customerUser?.points ?? 0) >= 100
                    ? 'Tukar 100 Poin'
                    : 'Poin Kurang'}
                </button>
              </div>

              {/* Reward 2: 200 Pts -> Diskon 20% */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Voucher Diskon 20%
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Potongan super hemat 20% untuk semua menu dimsum!
                  </p>
                  <span className="inline-block text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mt-1">
                    Butuh 200 Poin
                  </span>
                </div>

                <button
                  type="button"
                  disabled={redeemLoading !== null || (customerUser?.points ?? 0) < 200}
                  onClick={() => handleRedeemReward('voucher_20')}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-sm transition active:scale-95 shrink-0"
                >
                  {redeemLoading === 'voucher_20'
                    ? 'Menukar...'
                    : (customerUser?.points ?? 0) >= 200
                    ? 'Tukar 200 Poin'
                    : 'Poin Kurang'}
                </button>
              </div>

              {/* Reward 3: 250 Pts -> Dimsum Original Isi 5 pcs Gratis */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Dimsum Original (5 pcs)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gratis 1 box Dimsum Ayam Original isi 5 pcs langsung masuk keranjang!
                  </p>
                  <span className="inline-block text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
                    Butuh 250 Poin
                  </span>
                </div>

                <button
                  type="button"
                  disabled={redeemLoading !== null || (customerUser?.points ?? 0) < 250}
                  onClick={() => handleRedeemReward('dimsum_original_5')}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-sm transition active:scale-95 shrink-0"
                >
                  {redeemLoading === 'dimsum_original_5'
                    ? 'Menukar...'
                    : (customerUser?.points ?? 0) >= 250
                    ? 'Tukar 250 Poin'
                    : 'Poin Kurang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
