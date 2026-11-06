export type DeliveryType = 'kurir_toko' | 'pickup';
export type PaymentMethod = 'qris' | 'cod';
export type OrderStatus =
  | 'menunggu_konfirmasi'
  | 'disetujui'
  | 'diproses'
  | 'dikirim'
  | 'siap_pickup'
  | 'selesai'
  | 'dibatalkan';

export type PaymentStatus = 'menunggu_pembayaran' | 'lunas';

export interface PortionOption {
  pcs: number;
  price: number;
  name?: string;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  portions: PortionOption[];
  allowedToppings: ToppingOption[];
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  portion: number;
  topping: string;
  toppingName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  itemsTotal: number;
  discountAmount: number;
  voucherCode?: string;
  pointsUsed?: number;
  pointsEarned: number;
  totalAmount: number;
  channel: 'website' | 'whatsapp' | 'instagram' | 'outlet';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemedReward {
  id: string;
  rewardType: 'voucher_10' | 'voucher_20' | 'dimsum_original_5';
  title: string;
  pointsSpent: number;
  discountPercent?: number;
  isUsed: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  password?: string;
  phone?: string;
  address?: string;
  points: number;
  redeemedRewards?: RedeemedReward[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  favoriteItems: string[];
  tag: 'baru' | 'loyal' | 'lama_tidak_order';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  adminPhone: string;
  qrisHolder: string;
  qrisBank: string;
  openingHours: string;
}
