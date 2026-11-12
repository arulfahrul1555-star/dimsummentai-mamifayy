'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Phone,
  Flame,
  Search,
  Users,
  TrendingUp,
  PackageCheck,
  PlusCircle,
  LogOut,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Send,
  AlertTriangle,
  Award,
  Calendar,
  Filter,
  Star,
  Gift,
  ImageIcon,
  Upload,
  Camera,
  Check,
  Volume2,
  VolumeX,
  X,
  UserPlus,
} from 'lucide-react';
import { Order, Customer, Product, OrderStatus, PaymentStatus } from '@/types';
import {
  formatRupiah,
  createWhatsAppUrl,
  getOrderConfirmationMessage,
  getDeliveryNotificationMessage,
  getOrderCompletedMessage,
  getReactivationPromoMessage,
  getPointsReminderMessage,
} from '@/lib/whatsapp';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'approval' | 'operations' | 'crm' | 'reports' | 'pos' | 'menu'>('approval');

  // Product photo management states
  const [customImageUrls, setCustomImageUrls] = useState<Record<string, string>>({});
  const [imageSaveLoading, setImageSaveLoading] = useState<string | null>(null);
  const [imageSaveSuccess, setImageSaveSuccess] = useState<string | null>(null);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevPendingCountRef = React.useRef<number | null>(null);

  // Manual Add Customer in CRM tab
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Audio chime for new incoming orders
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  // Image compressor helper: shrinks camera images to max 1000px, ~100KB JPEG
  const compressImage = (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Delivery fee inputs for pending orders: { [orderId]: number }
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>({});

  // Filter in CRM tab
  const [crmTagFilter, setCrmTagFilter] = useState<'all' | 'baru' | 'loyal' | 'lama_tidak_order'>('all');
  const [crmSearch, setCrmSearch] = useState('');

  // Operations filter
  const [opsStatusFilter, setOpsStatusFilter] = useState<'all' | 'disetujui' | 'diproses' | 'dikirim' | 'siap_pickup' | 'selesai'>('all');

  // Manual POS state
  const [posName, setPosName] = useState('');
  const [posPhone, setPosPhone] = useState('');
  const [posAddress, setPosAddress] = useState('');
  const [posDeliveryType, setPosDeliveryType] = useState<'kurir_toko' | 'pickup'>('pickup');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'qris' | 'cod'>('qris');
  const [posSelectedProd, setPosSelectedProd] = useState('');
  const [posPortion, setPosPortion] = useState<number>(6);
  const [posTopping, setPosTopping] = useState<string>('original');
  const [posQty, setPosQty] = useState(1);
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posDeliveryFee, setPosDeliveryFee] = useState<number>(0);

  const fetchData = async () => {
    try {
      const [resOrders, resCustomers, resAnalytics, resMenu] = await Promise.all([
        fetch(`/api/orders?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/customers?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/analytics?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/menu?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (resOrders.success) {
        setOrders(resOrders.data);
        const pendingCount = resOrders.data.filter((o: Order) => o.status === 'menunggu_konfirmasi').length;
        if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
          playChime();
        }
        prevPendingCountRef.current = pendingCount;
      }
      if (resCustomers.success) setCustomers(resCustomers.data);
      if (resAnalytics.success) setAnalytics(resAnalytics.data);
      if (resMenu.success) {
        const fetchedProds: Product[] = resMenu.data.products || [];
        setProducts((prev) =>
          JSON.stringify(prev) === JSON.stringify(fetchedProds) ? prev : fetchedProds
        );
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Fast Real-Time polling every 3.5s for instant order & omzet updates
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, []);

  // Initialize POS menu selection once when products load (safe from polling stale-closure resets)
  useEffect(() => {
    if (products.length > 0 && (!posSelectedProd || !products.some((p) => p.id === posSelectedProd))) {
      const firstProd = products[0];
      setPosSelectedProd(firstProd.id);
      setPosPortion(firstProd.portions[0]?.pcs || 6);
      setPosTopping(firstProd.allowedToppings?.[0]?.id || '');
    }
  }, [products, posSelectedProd]);

  useEffect(() => {
    const secTimer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastSyncTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(secTimer);
  }, [lastSyncTime]);

  const handleManualFeeChange = (orderId: string, val: number) => {
    setDeliveryFees((prev) => ({ ...prev, [orderId]: val }));
  };

  // 1. Approve Order Action (Direct 1-Click Accept without WhatsApp redirect)
  const handleApproveOrder = async (order: Order) => {
    const feeToSet =
      order.deliveryType === 'kurir_toko'
        ? deliveryFees[order.id] !== undefined
          ? deliveryFees[order.id]
          : order.deliveryFee
        : 0;

    // Optimistic UI update for instant feedback
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'disetujui' as OrderStatus,
              deliveryFee: feeToSet,
              totalAmount: Math.max(0, o.itemsTotal - (o.discountAmount || 0) + feeToSet),
            }
          : o
      )
    );

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'disetujui',
          deliveryFee: feeToSet,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Direct approval - immediately sync dashboard without forcing WhatsApp redirect
        fetchData();
      } else {
        alert(data.message || 'Gagal menyetujui pesanan');
        fetchData();
      }
    } catch (err) {
      alert('Gagal menyetujui pesanan');
      fetchData();
    }
  };

  // 2. Reject / Cancel Order (Direct Reject with reason, no WhatsApp redirect)
  const handleRejectOrder = async (order: Order) => {
    const reason = prompt('Alasan penolakan / pembatalan pesanan (misal: stok hari ini habis):', 'Mohon maaf stok varian ini sudah habis untuk hari ini Kak.');
    if (reason === null) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'dibatalkan' as OrderStatus, adminNotes: reason } : o))
    );

    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dibatalkan',
          adminNotes: reason,
        }),
      });
      fetchData();
    } catch (err) {
      alert('Gagal membatalkan pesanan');
      fetchData();
    }
  };

  // 3. Update Order Status in Operations (WhatsApp ONLY when order is ready / finished)
  const handleUpdateStatus = async (order: Order, nextStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();

        // Optional WhatsApp notification trigger ONLY when order is ready / finished ("pesenan sudah jadi")
        if (nextStatus === 'siap_pickup') {
          const msg = getDeliveryNotificationMessage(data.data);
          const url = createWhatsAppUrl(order.customerPhone, msg);
          if (confirm(`Pesanan #${order.orderNumber} SUDAH JADI & SIAP PICKUP! Mau kabari Kak ${order.customerName} via WhatsApp?`)) {
            window.open(url, '_blank');
          }
        } else if (nextStatus === 'dikirim') {
          const msg = getDeliveryNotificationMessage(data.data);
          const url = createWhatsAppUrl(order.customerPhone, msg);
          if (confirm(`Pesanan #${order.orderNumber} SUDAH JADI & SEDANG DIANTAR KURIR! Mau kabari Kak ${order.customerName} via WhatsApp?`)) {
            window.open(url, '_blank');
          }
        } else if (nextStatus === 'selesai') {
          const msg = getOrderCompletedMessage(data.data);
          const url = createWhatsAppUrl(order.customerPhone, msg);
          if (confirm(`Pesanan #${order.orderNumber} SELESAI! Mau kirim ucapan terima kasih ke WhatsApp Kak ${order.customerName}?`)) {
            window.open(url, '_blank');
          }
        }
      } else {
        fetchData();
      }
    } catch (err) {
      alert('Gagal update status pesanan');
      fetchData();
    }
  };

  // 4. Toggle Payment Status (Lunas / Menunggu Pembayaran)
  const handleTogglePayment = async (order: Order) => {
    const nextStatus: PaymentStatus = order.paymentStatus === 'lunas' ? 'menunggu_pembayaran' : 'lunas';
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: nextStatus } : o))
    );

    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status pembayaran');
      fetchData();
    }
  };

  // POS Add item to cart
  const handlePosAddToCart = () => {
    const prod = products.find((p) => p.id === posSelectedProd) || products[0];
    if (!prod) return;

    const portionObj = prod.portions.find((p) => p.pcs === posPortion) || prod.portions[0];
    const toppingObj = (prod.allowedToppings || []).find((t) => t.id === posTopping) || prod.allowedToppings?.[0];
    const toppingPrice = toppingObj ? toppingObj.price : 0;
    const unitPrice = (portionObj ? portionObj.price : 0) + toppingPrice;
    const subtotal = unitPrice * posQty;

    setPosCart((prev) => [
      ...prev,
      {
        id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: prod.id,
        productName: prod.name,
        portion: portionObj ? portionObj.pcs : posPortion,
        topping: toppingObj ? toppingObj.id : '',
        toppingName: toppingObj ? toppingObj.name : 'Original',
        unitPrice,
        quantity: posQty,
        subtotal,
      },
    ]);
    setPosQty(1);
  };

  // POS Submit order
  const handlePosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert('Tambahkan menu ke keranjang kasir dulu!');
      return;
    }
    if (!posName.trim() || !posPhone.trim()) {
      alert('Isi nama dan no WA pembeli!');
      return;
    }

    const itemsTotal = posCart.reduce((sum, i) => sum + i.subtotal, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: posName,
          customerPhone: posPhone,
          customerAddress: posAddress,
          deliveryType: posDeliveryType,
          deliveryFee: posDeliveryType === 'kurir_toko' ? posDeliveryFee : 0,
          paymentMethod: posPaymentMethod,
          items: posCart,
          itemsTotal,
          channel: 'outlet',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pesanan Kasir #${data.data.orderNumber} berhasil dicatat!`);
        setPosCart([]);
        setPosName('');
        setPosPhone('');
        setPosAddress('');
        setPosDeliveryFee(0);
        fetchData();
        setActiveTab('approval');
      } else {
        alert(data.message || 'Gagal menyimpan pesanan kasir');
      }
    } catch (err) {
      alert('Gagal menyimpan pesanan kasir');
    }
  };

  const handleUpdateProductImage = async (productId: string, imageSrc: string) => {
    setImageSaveLoading(productId);
    setImageSaveSuccess(null);
    // Optimistic local update so preview changes instantly
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, image: imageSrc } : p))
    );
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, image: imageSrc }),
      });
      const data = await res.json();
      if (data.success) {
        setImageSaveSuccess(`Foto produk berhasil diperbarui secara permanen!`);
        fetchData();
      } else {
        alert(data.message || 'Gagal mengubah foto');
        fetchData();
      }
    } catch {
      alert('Kendala jaringan saat menyimpan foto');
      fetchData();
    } finally {
      setImageSaveLoading(null);
    }
  };

  const handleFileSelect = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageSaveLoading(productId);
      // Compress phone camera photos from 5MB+ down to ~90KB JPEG to prevent network timeout & 413 error
      const compressedBase64 = await compressImage(file, 900, 0.82);
      await handleUpdateProductImage(productId, compressedBase64);
    } catch (err) {
      alert('Gagal memproses file foto');
      setImageSaveLoading(null);
    }
  };

  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Nama pelanggan wajib diisi');
      return;
    }
    let phoneFormatted = newCustPhone.trim().replace(/[^0-9]/g, '');
    if (phoneFormatted.startsWith('0')) {
      phoneFormatted = '62' + phoneFormatted.slice(1);
    }
    setSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName.trim(),
          phone: phoneFormatted,
          address: newCustAddress.trim(),
          notes: newCustNotes.trim(),
          tag: 'baru',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) => [data.data, ...prev]);
        setIsAddCustomerOpen(false);
        setNewCustName('');
        setNewCustPhone('');
        setNewCustAddress('');
        setNewCustNotes('');
        alert('Pelanggan berhasil ditambahkan ke database CRM!');
        fetchData();
      } else {
        alert(data.message || 'Gagal menambahkan pelanggan');
      }
    } catch {
      alert('Kendala jaringan saat menyimpan pelanggan');
    } finally {
      setSavingCustomer(false);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'menunggu_konfirmasi');
  const activeOpsOrders = orders.filter((o) => {
    if (opsStatusFilter === 'all') {
      return ['disetujui', 'diproses', 'dikirim', 'siap_pickup'].includes(o.status);
    }
    return o.status === opsStatusFilter;
  });

  const filteredCustomers = customers.filter((c) => {
    const matchTag = crmTagFilter === 'all' || c.tag === crmTagFilter;
    const matchSearch =
      c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
      (c.phone || '').includes(crmSearch);
    return matchTag && matchSearch;
  });

  const activePosProd = products.find((p) => p.id === posSelectedProd) || products[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-sm shrink-0 bg-white">
              <img src="/logo-square.png" alt="Dimsummentai Mamifayy" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight">Dimsummentai Mamifayy</h1>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full border border-blue-400/40">
                  Panel Admin & CRM
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                adminmamifay@gmail.com • Sistem Ready Stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time pulse indicator */}
            <div className="flex items-center gap-1.5 bg-blue-900/80 border border-blue-600/70 px-2.5 py-1.5 rounded-xl text-[11px] text-blue-100 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-white hidden sm:inline">Live Real-Time</span>
              <span className="text-blue-300">({secondsAgo}d)</span>
            </div>

            {/* Sound notification toggle */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playChime();
              }}
              className={`p-2 rounded-xl transition ${
                soundEnabled
                  ? 'bg-blue-700 hover:bg-blue-600 text-amber-300'
                  : 'bg-blue-950/60 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Notifikasi Suara Aktif (Klik untuk mute)' : 'Notifikasi Suara Senyap'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              className="p-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-blue-100 hover:text-white transition"
              title="Refresh Data Sekarang"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-xl transition"
            >
              <span>Lihat Web Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin/login"
              className="text-xs bg-red-600/80 hover:bg-red-700 text-white font-medium px-3 py-2 rounded-xl transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="bg-blue-900/60 border-t border-blue-700/50 px-4">
          <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto py-1 scrollbar-none">
            {/* Tab 1: Approval */}
            <button
              onClick={() => setActiveTab('approval')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'approval'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Persetujuan Order</span>
              {pendingOrders.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            {/* Tab 2: Operations */}
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'operations'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Dapur & Kurir</span>
            </button>

            {/* Tab 3: CRM */}
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'crm'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Database Pelanggan CRM</span>
              {customers.filter((c) => c.tag === 'lama_tidak_order').length > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {customers.filter((c) => c.tag === 'lama_tidak_order').length}
                </span>
              )}
            </button>

            {/* Tab 4: Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Laporan & Omzet</span>
            </button>

            {/* Tab 5: POS Kasir */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pos'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-300" />
              <span>Kasir Kilat (POS)</span>
            </button>

            {/* Tab 6: Kelola Foto & Menu */}
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-700/50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>Kelola Foto & Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-slate-600">Memuat data operasional Mamifayy...</p>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* TAB 1: PERSETUJUAN ORDER (ORDER APPROVAL HUB)            */}
            {/* ======================================================== */}
            {activeTab === 'approval' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Persetujuan Pesanan Masuk</span>
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {pendingOrders.length} Perlu Konfirmasi
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cek ketersediaan stok, masukkan ongkir kurir toko secara manual, lalu setujui untuk lanjut ke dapur.
                    </p>
                  </div>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-90" />
                    <h3 className="font-bold text-slate-800 text-sm">Semua Pesanan Sudah Dikonfirmasi!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tidak ada pesanan baru yang menunggu persetujuan admin saat ini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {pendingOrders.map((order) => {
                      const currentFee =
                        deliveryFees[order.id] !== undefined
                          ? deliveryFees[order.id]
                          : order.deliveryFee;

                      const calculatedTotal = Math.max(
                        0,
                        order.itemsTotal - (order.discountAmount || 0) + (order.deliveryType === 'kurir_toko' ? currentFee : 0)
                      );

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden flex flex-col justify-between"
                        >
                          <div className="p-4 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-amber-900">
                                #{order.orderNumber}
                              </span>
                              <span className="text-[11px] text-slate-500 ml-2">
                                {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                WIB
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {order.deliveryType === 'kurir_toko' ? (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Bike className="w-3 h-3" /> Kurir Toko
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Store className="w-3 h-3" /> Pickup
                                </span>
                              )}
                              <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3.5 flex-1">
                            {/* Customer Info */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Pemesan:</span>
                                <span className="font-bold text-slate-900">{order.customerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">WhatsApp:</span>
                                <a
                                  href={`https://wa.me/${order.customerPhone}`}
                                  target="_blank"
                                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{order.customerPhone}</span>
                                </a>
                              </div>
                              {order.deliveryType === 'kurir_toko' ? (
                                <div className="pt-1 border-t border-slate-200">
                                  <span className="text-slate-500 block text-[11px]">Alamat Pengantaran:</span>
                                  <span className="font-semibold text-slate-800 leading-snug">
                                    {order.customerAddress || '-'}
                                  </span>
                                </div>
                              ) : (
                                <div className="pt-1 border-t border-slate-200">
                                  <span className="text-emerald-700 block text-[11px] font-bold">🏪 Ambil di Outlet:</span>
                                  <span className="font-semibold text-slate-800 leading-snug">
                                    Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07
                                  </span>
                                </div>
                              )}
                              {order.customerNotes && (
                                <div className="text-[11px] text-amber-800 bg-amber-100/60 p-1.5 rounded-lg mt-1">
                                  <strong>Catatan:</strong> {order.customerNotes}
                                </div>
                              )}
                            </div>

                            {/* Order Items */}
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Pesanan Menu:
                              </h4>
                              <div className="space-y-1.5">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="text-xs flex justify-between items-start bg-slate-50 p-2 rounded-lg"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-800">{item.productName}</p>
                                      <p className="text-[11px] text-blue-700 font-semibold">
                                        Porsi Isi {item.portion} • {item.toppingName}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        {item.quantity}x @ {formatRupiah(item.unitPrice)}
                                      </p>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                      {formatRupiah(item.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Discount from Points Voucher if any */}
                            {order.discountAmount && order.discountAmount > 0 ? (
                              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs flex justify-between items-center text-emerald-900">
                                <div className="flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="font-semibold">Voucher Diskon ({order.pointsUsed || 0} Poin Ditukar):</span>
                                </div>
                                <span className="font-extrabold text-emerald-700">-{formatRupiah(order.discountAmount)}</span>
                              </div>
                            ) : null}

                            {/* Manual Delivery Fee Input (Only for Kurir Toko) */}
                            {order.deliveryType === 'kurir_toko' && (
                              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                                <label className="text-xs font-bold text-blue-900 block mb-1">
                                  🛵 Input Ongkir Kurir Toko (Manual):
                                </label>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-blue-700">Rp</span>
                                  <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={currentFee}
                                    onChange={(e) =>
                                      handleManualFeeChange(order.id, parseInt(e.target.value) || 0)
                                    }
                                    placeholder="Contoh: 10000"
                                    className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <p className="text-[10px] text-blue-600 mt-1">
                                  * Nominal ini akan ditambahkan ke total tagihan yang dikirim ke WA pelanggan.
                                </p>
                              </div>
                            )}

                            {/* Financial Total */}
                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <span className="text-slate-500 block text-[11px]">Subtotal Makanan:</span>
                                <span className="font-semibold text-slate-700">
                                  {formatRupiah(order.itemsTotal)}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-500 block text-[11px]">Total Setelah Ongkir:</span>
                                <span className="text-base font-extrabold text-blue-700">
                                  {formatRupiah(calculatedTotal)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Approval Actions */}
                          <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                            <button
                              onClick={() => handleRejectOrder(order)}
                              className="px-4 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Tolak</span>
                            </button>

                            <button
                              onClick={() => handleApproveOrder(order)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Terima Pesanan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: PAPAN OPERASIONAL (DAPUR & KURIR TOKO)           */}
            {/* ======================================================== */}
            {activeTab === 'operations' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span>Papan Operasional Dapur & Pengantaran</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pantau proses torched saus mentai sampai kurir toko selesai mengantar.
                    </p>
                  </div>

                  {/* Filter Status Pills */}
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {(['all', 'disetujui', 'diproses', 'dikirim', 'siap_pickup', 'selesai'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setOpsStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize whitespace-nowrap ${
                          opsStatusFilter === st
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' && 'Semua Aktif'}
                        {st === 'disetujui' && 'Antre Dapur'}
                        {st === 'diproses' && 'Sedang Ditorch 🔥'}
                        {st === 'dikirim' && 'Diantar Kurir 🛵'}
                        {st === 'siap_pickup' && 'Siap Pickup 🥡'}
                        {st === 'selesai' && 'Selesai'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOpsOrders.map((order) => {
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-900">
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                order.status === 'disetujui'
                                  ? 'bg-amber-100 text-amber-800'
                                  : order.status === 'diproses'
                                  ? 'bg-orange-100 text-orange-800 animate-pulse'
                                  : order.status === 'dikirim'
                                  ? 'bg-sky-100 text-sky-800'
                                  : order.status === 'siap_pickup'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {order.status === 'disetujui' && 'Antre Dapur'}
                              {order.status === 'diproses' && 'Ditorch 🔥'}
                              {order.status === 'dikirim' && 'Diantar Kurir 🛵'}
                              {order.status === 'siap_pickup' && 'Siap Ambil 🥡'}
                              {order.status === 'selesai' && 'Selesai'}
                            </span>
                          </div>

                          <div className="text-xs space-y-1 mb-3">
                            <p className="font-bold text-slate-800">{order.customerName}</p>
                            <p className="text-[11px] text-slate-500">
                              {order.deliveryType === 'kurir_toko' ? '🛵 Kurir Toko' : '🏪 Ambil di Outlet'} •{' '}
                              <span className="uppercase font-semibold">{order.paymentMethod}</span>
                            </p>
                            {order.customerAddress && (
                              <p className="text-[11px] text-slate-600 line-clamp-1">
                                📍 {order.customerAddress}
                              </p>
                            )}
                          </div>

                          {/* Items */}
                          <div className="bg-slate-50 p-2 rounded-xl text-xs space-y-1">
                            {order.items.map((i) => (
                              <div key={i.id} className="flex justify-between text-[11px]">
                                <span className="font-medium text-slate-700">
                                  {i.quantity}x {i.productName} ({i.portion}p)
                                </span>
                                <span className="text-slate-500">{i.toppingName}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Status Pill Toggle */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Total: {formatRupiah(order.totalAmount)}</span>
                          <button
                            onClick={() => handleTogglePayment(order)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                              order.paymentStatus === 'lunas'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {order.paymentStatus === 'lunas' ? '✅ Lunas' : '⏳ Belum Bayar'}
                          </button>
                        </div>

                        {/* Status Advancement Buttons */}
                        <div className="space-y-1.5 pt-1">
                          {order.status === 'disetujui' && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'diproses')}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Mulai Torch di Dapur</span>
                            </button>
                          )}

                          {order.status === 'diproses' && (
                            <div className="flex gap-1.5">
                              {order.deliveryType === 'kurir_toko' ? (
                                <button
                                  onClick={() => handleUpdateStatus(order, 'dikirim')}
                                  className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <Bike className="w-3.5 h-3.5" />
                                  <span>Berangkatkan Kurir Toko</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(order, 'siap_pickup')}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                  <span>Siap Diambil (Pickup)</span>
                                </button>
                              )}
                            </div>
                          )}

                          {(order.status === 'dikirim' || order.status === 'siap_pickup') && (
                            <button
                              onClick={() => handleUpdateStatus(order, 'selesai')}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Selesaikan Pesanan & Rekap</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: DATABASE PELANGGAN CRM (CUSTOMER RETENTION)       */}
            {/* ======================================================== */}
            {activeTab === 'crm' && (
              <div className="space-y-4">
                {/* Header & Action Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Database Pelanggan & CRM Mamifayy</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Otomatis mencatat riwayat transaksi, poin loyalty, dan menu favorit pelanggan.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddCustomerOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Tambah Pelanggan Baru</span>
                    </button>
                  </div>

                  {/* Search Bar - Full Width on Mobile */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor WhatsApp pelanggan..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                    />
                    {crmSearch && (
                      <button
                        onClick={() => setCrmSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title="Hapus pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scroll Filter Tabs for Mobile & Desktop */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                    {(
                      [
                        { id: 'all', label: 'Semua', count: customers.length },
                        {
                          id: 'baru',
                          label: 'Pelanggan Baru',
                          count: customers.filter((c) => c.tag === 'baru').length,
                        },
                        {
                          id: 'loyal',
                          label: 'Loyal / VIP ⭐',
                          count: customers.filter((c) => c.tag === 'loyal').length,
                        },
                        {
                          id: 'lama_tidak_order',
                          label: '>14 Hari Belum Order ⚠️',
                          count: customers.filter((c) => c.tag === 'lama_tidak_order').length,
                        },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCrmTagFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                          crmTagFilter === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            crmTagFilter === tab.id
                              ? 'bg-blue-800 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {filteredCustomers.length === 0 && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm mb-1">
                      Tidak ada data pelanggan yang sesuai
                    </p>
                    <p className="text-slate-400 mb-3">
                      Coba ganti kata kunci pencarian atau ubah filter kategori.
                    </p>
                    {(crmSearch || crmTagFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setCrmSearch('');
                          setCrmTagFilter('all');
                        }}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Customer Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCustomers.map((cust) => {
                    const promoMessage = getReactivationPromoMessage(cust);
                    const waPromoUrl = createWhatsAppUrl(cust.phone || '', promoMessage);
                    const pointsMessage = getPointsReminderMessage(cust);
                    const waPointsUrl = createWhatsAppUrl(cust.phone || '', pointsMessage);

                    return (
                      <div
                        key={cust.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-3 hover:border-blue-200 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h3 className="font-extrabold text-slate-900 text-sm truncate">
                              {cust.name}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                cust.tag === 'loyal'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : cust.tag === 'lama_tidak_order'
                                  ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {cust.tag === 'loyal' && 'Loyal ⭐'}
                              {cust.tag === 'lama_tidak_order' && '>14 Hari ⚠️'}
                              {cust.tag === 'baru' && 'Baru'}
                            </span>
                          </div>

                          {/* Points Loyalty Badge */}
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>{cust.points ?? 0} Poin</span>
                            </span>
                            {(cust.points || 0) >= 10 ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Voucher Diskon 15K Ready 🎉
                              </span>
                            ) : (cust.points || 0) >= 5 ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Diskon 5K Ready ✨
                              </span>
                            ) : null}
                          </div>

                          {cust.phone ? (
                            <a
                              href={`https://wa.me/${cust.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 mb-2"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{cust.phone}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 block mb-2">Belum ada no WA</span>
                          )}

                          {cust.address && (
                            <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
                              📍 {cust.address}
                            </p>
                          )}

                          <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-100">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Transaksi:</span>
                              <span className="font-bold text-slate-800">
                                {cust.totalOrders ?? 0}x Order
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Belanja:</span>
                              <span className="font-bold text-blue-700">
                                {formatRupiah(cust.totalSpent ?? 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Order Terakhir:</span>
                              <span className="text-slate-600">
                                {cust.lastOrderDate
                                  ? new Date(cust.lastOrderDate).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Belum order'}
                              </span>
                            </div>
                          </div>

                          {/* Safe Menu Favorit rendering (prevents undefined crash on mobile) */}
                          {(cust.favoriteItems || []).length > 0 && (
                            <div className="mt-2 text-[11px] text-slate-500">
                              <span className="font-semibold block mb-0.5">Menu Favorit:</span>
                              <div className="flex flex-wrap gap-1">
                                {(cust.favoriteItems || []).map((fav, i) => (
                                  <span
                                    key={i}
                                    className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {fav}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Follow-up Buttons */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          {(cust.points || 0) >= 5 && (
                            <a
                              href={waPointsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Ingatkan Tukar Voucher ({cust.points} Poin)</span>
                            </a>
                          )}

                          <a
                            href={waPromoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {cust.tag === 'lama_tidak_order'
                                ? 'Sapa Promo Akhir Pekan (1-Klik)'
                                : 'Kirim Pesan WhatsApp'}
                            </span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal: Tambah Pelanggan Baru Manual */}
                {isAddCustomerOpen && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-sky-300" />
                          <h3 className="font-extrabold text-sm">Tambah Pelanggan Baru ke CRM</h3>
                        </div>
                        <button
                          onClick={() => setIsAddCustomerOpen(false)}
                          className="p-1 rounded-lg hover:bg-blue-700 text-white/80 hover:text-white transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveNewCustomer} className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Nama Pelanggan <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Kak Dinda"
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Nomor WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="08123456789 atau 628123456789"
                            value={newCustPhone}
                            onChange={(e) => setNewCustPhone(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Format otomatis dikonversi ke kode 62 untuk WhatsApp.
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Alamat Pengiriman (Opsional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Alamat rumah / patokan kurir"
                            value={newCustAddress}
                            onChange={(e) => setNewCustAddress(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Catatan Khusus (Opsional)
                          </label>
                          <input
                            type="text"
                            placeholder="Misal: Suka mentai pedas gurih"
                            value={newCustNotes}
                            onChange={(e) => setNewCustNotes(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddCustomerOpen(false)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={savingCustomer}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                          >
                            {savingCustomer ? (
                              <span>Menyimpan...</span>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Simpan Pelanggan</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: LAPORAN OMZET & FINANSIAL (QRIS VS COD AUDIT)    */}
            {/* ======================================================== */}
            {activeTab === 'reports' && analytics && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Laporan Keuangan & Audit Setoran Kas Kurir</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data otomatis terekap dari pesanan yang selesai atau lunas.
                  </p>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Omzet Hari Ini
                    </span>
                    <span className="text-xl font-black text-blue-700 mt-1 block">
                      {formatRupiah(analytics.todayOmzet)}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      {analytics.todayOrdersCount} transaksi hari ini
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Omzet Kumulatif
                    </span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">
                      {formatRupiah(analytics.totalOmzet)}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">Semua pesanan selesai</span>
                  </div>

                  {/* Cash COD vs Non-Cash QRIS Audit */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      💵 Total Uang Kas COD (Kurir Toko)
                    </span>
                    <span className="text-xl font-black text-emerald-700 mt-1 block">
                      {formatRupiah(analytics.totalCodAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-800 mt-1 block">
                      * Uang fisik yang harus disetor kurir
                    </span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-sm">
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                      💳 Total Masuk QRIS / Transfer
                    </span>
                    <span className="text-xl font-black text-blue-700 mt-1 block">
                      {formatRupiah(analytics.totalQrisAmount)}
                    </span>
                    <span className="text-[11px] text-blue-800 mt-1 block">
                      * Masuk rekening bank toko
                    </span>
                  </div>
                </div>

                {/* Portion Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Porsi Paling Laris (Ukuran Box)
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(analytics.portionCounts).map(([pcs, count]: any) => (
                        <div key={pcs} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Porsi Isi {pcs} pcs</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${Math.min(100, count * 20)}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-slate-900 w-12 text-right">
                              {count} box
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Varian Menu Favorit
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(analytics.productCounts).map(([name, count]: any) => (
                        <div key={name} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{name}</span>
                          <span className="font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full">
                            {count} porsi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: KASIR KILAT (POS INPUT MANUAL)                    */}
            {/* ======================================================== */}
            {activeTab === 'pos' && (
              <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                    <span>Kasir Kilat (Pencatatan Pesanan Manual)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan saat ada pesanan datang langsung ke outlet fisik atau lewat chat WA/IG manual.
                  </p>
                </div>

                <form onSubmit={handlePosSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Pemesan *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bu Rini"
                        value={posName}
                        onChange={(e) => setPosName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        No. WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="08xxxxxxxx"
                        value={posPhone}
                        onChange={(e) => setPosPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Add Item Row */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Pilih Menu & Varian:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={activePosProd?.id || ''}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setPosSelectedProd(nextId);
                          const prod = products.find((p) => p.id === nextId);
                          if (prod) {
                            setPosPortion(prod.portions[0]?.pcs || 6);
                            setPosTopping(prod.allowedToppings?.[0]?.id || '');
                          }
                        }}
                        className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={posPortion}
                        onChange={(e) => setPosPortion(parseInt(e.target.value, 10))}
                        className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        {(activePosProd?.portions || []).map((portion, idx) => (
                          <option key={`${portion.pcs}-${idx}`} value={portion.pcs}>
                            {portion.name ? portion.name : `Isi ${portion.pcs}`} ({formatRupiah(portion.price)})
                          </option>
                        ))}
                      </select>

                      {activePosProd?.allowedToppings && activePosProd.allowedToppings.length > 0 ? (
                        <select
                          value={posTopping}
                          onChange={(e) => setPosTopping(e.target.value)}
                          className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                        >
                          {activePosProd.allowedToppings.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.price > 0 ? `(+${formatRupiah(t.price)})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center px-2.5 py-2 bg-slate-100 rounded-lg border border-slate-200">
                          Tanpa pilihan topping
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span>Jumlah Box:</span>
                        <input
                          type="number"
                          min={1}
                          value={posQty}
                          onChange={(e) => setPosQty(parseInt(e.target.value, 10) || 1)}
                          className="w-16 p-1 rounded-lg border border-slate-300 text-center font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handlePosAddToCart}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        + Tambah Menu
                      </button>
                    </div>
                  </div>

                  {/* Cart preview */}
                  {posCart.length > 0 && (
                    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Daftar Menu Dipilih ({posCart.length} item):
                      </span>
                      <div className="space-y-1.5">
                        {posCart.map((i, idx) => (
                          <div
                            key={i.id || idx}
                            className="text-xs flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                          >
                            <span className="text-slate-800">
                              <strong>{i.quantity}x</strong> {i.productName} (Isi {i.portion} • {i.toppingName})
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-slate-900">{formatRupiah(i.subtotal)}</span>
                              <button
                                type="button"
                                onClick={() => setPosCart((prev) => prev.filter((_, index) => index !== idx))}
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 transition"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-blue-200 text-xs font-extrabold text-blue-900">
                        <span>Subtotal Menu:</span>
                        <span>{formatRupiah(posCart.reduce((sum, i) => sum + i.subtotal, 0))}</span>
                      </div>
                    </div>
                  )}

                  {/* Delivery & Payment options */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold block mb-1">Pengantaran:</label>
                      <select
                        value={posDeliveryType}
                        onChange={(e: any) => setPosDeliveryType(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300"
                      >
                        <option value="pickup">🏪 Ambil di Outlet (Pickup)</option>
                        <option value="kurir_toko">🛵 Kurir Toko Mamifayy</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Pembayaran:</label>
                      <select
                        value={posPaymentMethod}
                        onChange={(e: any) => setPosPaymentMethod(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300"
                      >
                        <option value="qris">💳 QRIS / Transfer</option>
                        <option value="cod">💵 Bayar Tunai / COD</option>
                      </select>
                    </div>
                  </div>

                  {posDeliveryType === 'kurir_toko' && (
                    <div>
                      <label className="text-xs font-bold block mb-1">
                        Alamat Pengiriman & Ongkir:
                      </label>
                      <input
                        type="text"
                        placeholder="Alamat lengkap tujuan"
                        value={posAddress}
                        onChange={(e) => setPosAddress(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 mb-2"
                      />
                      <input
                        type="number"
                        placeholder="Nominal Ongkir Kurir (Rp)"
                        value={posDeliveryFee}
                        onChange={(e) => setPosDeliveryFee(parseInt(e.target.value) || 0)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Simpan & Masukkan ke Antrean Order</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tab 6: Kelola Foto & Menu Produk */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span>Kelola Foto Produk Saya Sendiri</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload foto asli produk Anda langsung dari galeri HP, jepret langsung dari kamera HP, atau masukkan link URL gambar.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-2xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Foto otomatis dikompres ringan & disimpan permanen tanpa resiko broken link.
                    </span>
                  </div>
                </div>

                {imageSaveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{imageSaveSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {products.map((p) => {
                    const isMentai = p.id === 'prod-mentai';
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 transition"
                      >
                        <div>
                          {/* Photo preview with current image */}
                          <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 group">
                            <img
                              src={p.image}
                              alt={p.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/logo-square.png';
                              }}
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 bg-blue-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                              {p.category}
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-lg font-mono truncate">
                              {p.image.startsWith('data:') ? 'Foto Custom Tersimpan (Base64)' : p.image}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                            {p.allowedToppings && p.allowedToppings.length > 0 ? (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                                Ada {p.allowedToppings.length} Pilihan Varian
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                                Tanpa Pilihan Topping
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-4">{p.description}</p>

                          {/* Porsi info */}
                          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-4">
                            <span className="font-bold block mb-1">Varian Porsi:</span>
                            <div className="flex flex-wrap gap-1">
                              {p.portions.map((po) => (
                                <span key={po.pcs} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  Isi {po.pcs}: {formatRupiah(po.price)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Image changer tools */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-800 block mb-1.5">
                              Upload Foto Produk Anda Sendiri:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* File Gallery Picker */}
                              <label className="cursor-pointer flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition active:scale-95 shadow-sm text-center">
                                <Upload className="w-4 h-4 shrink-0" />
                                <span>Pilih dari Galeri / File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(p.id, e)}
                                />
                              </label>

                              {/* Direct Camera Capture for Mobile HP */}
                              <label className="cursor-pointer flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition active:scale-95 shadow-sm text-center">
                                <Camera className="w-4 h-4 shrink-0" />
                                <span>Foto dari Kamera HP</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handleFileSelect(p.id, e)}
                                />
                              </label>
                            </div>

                            {imageSaveLoading === p.id && (
                              <p className="text-xs text-blue-600 font-bold mt-2 animate-pulse flex items-center gap-1.5 bg-blue-50 p-2 rounded-lg">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Mengompres & menyimpan foto produk Anda...</span>
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-800 block mb-1">
                              Atau Masukkan Link / URL Foto Gambar:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://... (link gambar)"
                                value={customImageUrls[p.id] ?? ''}
                                onChange={(e) =>
                                  setCustomImageUrls((prev) => ({ ...prev, [p.id]: e.target.value }))
                                }
                                className="text-xs p-2.5 rounded-xl border border-slate-300 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                disabled={!customImageUrls[p.id]}
                                onClick={() => handleUpdateProductImage(p.id, customImageUrls[p.id])}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
                              >
                                Simpan Link
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
