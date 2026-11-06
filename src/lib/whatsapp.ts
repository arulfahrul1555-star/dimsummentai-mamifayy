import { Order, Customer } from '@/types';

// Format Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Clean phone for WhatsApp link (convert 08xx to 628xx)
export function sanitizeWhatsAppPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

// Generate WhatsApp deep link
export function createWhatsAppUrl(phone: string, text: string): string {
  const cleanNumber = sanitizeWhatsAppPhone(phone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

// 1. Template: Konfirmasi Pesanan & Total Tagihan (Disetujui Admin)
export function getOrderConfirmationMessage(order: Order, storePhone: string): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}* (${item.portion} pcs)\n   Topping: ${item.toppingName}\n   Jumlah: ${item.quantity}x @ ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`
    )
    .join('\n');

  const deliveryInfo =
    order.deliveryType === 'kurir_toko'
      ? `🛵 *Pengiriman:* Kurir Toko Mamifayy\n📍 *Alamat:* ${order.customerAddress || '-'}\n📝 *Catatan:* ${order.customerNotes || '-'}\n📦 *Ongkir Kurir:* ${formatRupiah(order.deliveryFee)}`
      : `🏪 *Pengambilan:* Ambil Sendiri (Pickup di Outlet Mamifayy)\n📍 *Alamat Outlet:* Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07\n📝 *Catatan:* ${order.customerNotes || '-'}`;

  const paymentInstruction =
    order.paymentMethod === 'qris'
      ? `💳 *Metode Pembayaran:* QRIS / Transfer Bank\nSilakan transfer dan kirim bukti pembayaran ke chat ini ya Kak.`
      : `💵 *Metode Pembayaran:* COD (Bayar Tunai saat pesanan tiba ke Kurir Toko)`;

  const discountInfo =
    (order.discountAmount && order.discountAmount > 0)
      ? `🎟️ *Voucher Poin (${order.pointsUsed || 0} Poin):* -${formatRupiah(order.discountAmount)}\n`
      : '';

  const pointsEarnedInfo = order.pointsEarned
    ? `⭐ *Poin Didapat dari Pesanan ini:* +${order.pointsEarned} Poin Mamifayy!\n`
    : '';

  return `*DIMSUMMENTAI MAMIFAYY* ✨
Halo Kak *${order.customerName}*! Pesanan kamu sudah *DISETUJUI & DIKONFIRMASI* oleh Admin. 🎉

📋 *No. Pesanan:* ${order.orderNumber}
----------------------------------------
*Rincian Menu:*
${itemsText}
----------------------------------------
💵 Subtotal Makanan: ${formatRupiah(order.itemsTotal)}
${discountInfo}${deliveryInfo}
----------------------------------------
*TOTAL PEMBAYARAN: ${formatRupiah(order.totalAmount)}*
${pointsEarnedInfo}${paymentInstruction}

Pesanan akan segera masuk dapur untuk disiapkan dan ditorch spesial untuk Kakak! 🔥
Terima kasih banyak ya Kak! 🙏`;
}

// 2. Template: Status Sedang Diantar / Siap Diambil
export function getDeliveryNotificationMessage(order: Order): string {
  if (order.deliveryType === 'kurir_toko') {
    return `*DIMSUMMENTAI MAMIFAYY* 🛵💨
Halo Kak *${order.customerName}*!

Kabar gembira! Pesanan kamu *(${order.orderNumber})* sudah selesai ditorch hangat-hangat dan *SEDANG DIANTAR OLEH KURIR TOKO* menuju alamat Kakak:

📍 *Tujuan:* ${order.customerAddress}
${order.paymentMethod === 'cod' ? `💵 *Siapkan Uang Pas COD:* ${formatRupiah(order.totalAmount)}` : `✅ *Status Pembayaran:* Lunas (QRIS)`}

Mohon pastikan nomor WhatsApp aktif ya Kak agar kurir mudah menghubungi. Selamat menikmati! 🔥🥢`;
  } else {
    return `*DIMSUMMENTAI MAMIFAYY* 🥡
Halo Kak *${order.customerName}*!

Pesanan kamu *(${order.orderNumber})* sudah selesai disiapkan & ditorch harum!
Sekarang sudah *SIAP DIAMBIL (PICKUP)* di outlet kami ya Kak:

📍 *Alamat Outlet Mamifayy:*
Jalan Raya Kadungora Kp. Sindangsari Rt.03 Rw.07

Ditunggu kedatangannya ya Kak! Silakan sebutkan nomor pesanan #${order.orderNumber} saat tiba di outlet. Terima kasih banyak! 🙏✨`;
  }
}

// 3. Template: Pesanan Selesai & Permintaan Ulasan
export function getOrderCompletedMessage(order: Order): string {
  return `*DIMSUMMENTAI MAMIFAYY* ❤️
Halo Kak *${order.customerName}*!

Pesanan *${order.orderNumber}* sudah selesai. Terima kasih banyak sudah order di Dimsummentai Mamifayy! 🙏✨

Bagaimana rasa dimsum dan saus mentainya Kak? Semoga cocok dan nagih di lidah ya! Jika berkenan, kami sangat berterima kasih atas ulasan atau saran Kakak.

Sampai jumpa di pesanan berikutnya ya Kak! 🥰🥢`;
}

// 4. Template: Sapaan Promosi Pelanggan Lama (>14 Hari Belum Order)
export function getReactivationPromoMessage(customer: Customer): string {
  const name = customer?.name || 'Pelanggan';
  return `Halo Kak *${name}*! 🥰
Salam hangat dari *Dimsummentai Mamifayy*!

Kangen lumernya saus mentai gurih dan keju torch khas Mamifayy? 🔥
Khusus pelanggan setia seperti Kakak, kami ada penawaran spesial minggu ini:

✨ *Diskon Khusus / Bonus Topping Ekstra Melting* untuk pesanan porsi Party Box (isi 10 atau 16 pcs)!

Ready stock hari ini dan siap diantar langsung kurir toko kami.
Mau dikirimin menu favorit Kakak hari ini? Balas pesan ini untuk langsung kami siapkan ya Kak! 🛵🥢`;
}

// 5. Template: Info Poin Loyalty & Voucher Diskon
export function getPointsReminderMessage(customer: Customer): string {
  const name = customer?.name || 'Pelanggan';
  const points = customer?.points || 0;
  return `Halo Kak *${name}*! ⭐
Salam dari *Dimsummentai Mamifayy*!

Kabar gembira! Kakak saat ini punya *${points} Poin Loyalty Mamifayy* yang siap ditukarkan! 🎉

🎁 *Pilihan Hadiah Voucher:*
• Tukar *5 Poin* ➡️ Potongan Langsung *Rp 5.000*
• Tukar *10 Poin* ➡️ Potongan Langsung *Rp 15.000*

Yuk pesan dimsum mentai favorit Kakak hari ini dan gunakan voucher diskonnya langsung lewat link katalog kami! Mau kami pesankan sekarang Kak? 🥢🔥`;
}
