// Indonesian Western Time (WIB - UTC+7) Utility

export interface WibNotificationItem {
  id: string;
  category: 'order' | 'voucher' | 'promo' | 'system';
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  timestampId: string;
  timestampEn: string;
  isRead: boolean;
  orderNumber?: string;
  courierStatusId?: string;
  courierStatusEn?: string;
  destination?: string;
  voucherCode?: string;
  discountBadge?: string;
  link: string;
}

/**
 * Returns current Date adjusted to Indonesian Western Time (WIB / UTC+7).
 */
export const getWibNow = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
};

/**
 * Format any date into Indonesian Western Time (WIB) representation.
 */
export const formatWibDateTime = (
  dateInput?: string | number | Date,
  options?: { language?: 'id' | 'en'; includeTime?: boolean }
): string => {
  const date = dateInput ? new Date(dateInput) : getWibNow();
  const lang = options?.language || 'id';
  const includeTime = options?.includeTime !== false;

  const formatted = date.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
    hour12: false,
  });

  return includeTime ? `${formatted} WIB` : formatted;
};

/**
 * Get dynamic daily notifications synchronized with Indonesian WIB calendar & time.
 */
export const getDynamicWibNotifications = (): WibNotificationItem[] => {
  const wib = getWibNow();
  const dayOfWeek = wib.getDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu
  const hours = wib.getHours();
  const dateNum = wib.getDate();
  const monthNamesId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const todayStrId = `${dateNum} ${monthNamesId[wib.getMonth()]}`;
  const todayStrEn = `${dateNum} ${monthNamesEn[wib.getMonth()]}`;

  // 1. Daily Day-Specific Voucher & Promo
  const dailyThemes: Record<number, { titleId: string; titleEn: string; descId: string; descEn: string; code: string; badge: string }> = {
    0: {
      titleId: 'Promo Super Sunday 20%',
      titleEn: 'Super Sunday 20% OFF',
      descId: `Spesial hari Minggu ${todayStrId}, nikmati diskon 20% untuk semua gadget & aksesoris.`,
      descEn: `Special Sunday ${todayStrEn} deal, enjoy 20% off all gadgets & accessories.`,
      code: 'SUNDAY20',
      badge: 'DISKON 20%',
    },
    1: {
      titleId: 'Semangat Senin Cashback 15%',
      titleEn: 'Monday Booster 15% Cashback',
      descId: `Awali pekan ini (${todayStrId}) dengan cashback hingga Rp 150.000 memakai kode SENINSERU.`,
      descEn: `Kick off this week (${todayStrEn}) with cashback up to IDR 150,000 using code SENINSERU.`,
      code: 'SENINSERU',
      badge: 'CASHBACK 15%',
    },
    2: {
      titleId: 'Selasa Tech Trend Flash Drop',
      titleEn: 'Tech Tuesday Special Drop',
      descId: `Koleksi laptop & periferal pilihan diskon ekstra Rp 100.000 hari ini (${todayStrId}).`,
      descEn: `Exclusive laptop & accessories discount of IDR 100,000 today (${todayStrEn}).`,
      code: 'SELASATECH',
      badge: 'POTONGAN 100RB',
    },
    3: {
      titleId: 'Rabu Hemat Diskon 15%',
      titleEn: 'Wednesday Midweek Special',
      descId: `Klaim voucher belanja tengah pekan edisi ${todayStrId} sebelum pukul 23:59 WIB.`,
      descEn: `Claim your midweek shopping voucher for ${todayStrEn} before 23:59 WIB.`,
      code: 'RABUHEMAT',
      badge: 'DISKON 15%',
    },
    4: {
      titleId: 'Kamis Manis Voucher Spesial',
      titleEn: 'Thursday Sweet Treats',
      descId: `Voucher belanja Rp 75.000 untuk transaksi gadget & fashion hari ini (${todayStrId}).`,
      descEn: `IDR 75,000 discount voucher for gadget & fashion orders today (${todayStrEn}).`,
      code: 'KAMISMANIS',
      badge: 'VOUCHER 75RB',
    },
    5: {
      titleId: 'Jumat Berkah Weekend Warm-Up',
      titleEn: 'Friday Blessing Weekend Deal',
      descId: `Gratis ongkir se-Indonesia + diskon ekstra menyambut akhir pekan (${todayStrId}).`,
      descEn: `Free nationwide shipping + extra discount to welcome the weekend (${todayStrEn}).`,
      code: 'JUMATBERKAH',
      badge: 'FREE ONGKIR',
    },
    6: {
      titleId: 'Sabtu Heboh Weekend Flash Spree',
      titleEn: 'Saturday Weekend Mega Sale',
      descId: `Pesta diskon akhir pekan edisi ${todayStrId}, hemat hingga 50% untuk produk bertanda khusus.`,
      descEn: `Weekend shopping spree on ${todayStrEn}, save up to 50% on select flagship items.`,
      code: 'SABTUHEBOH',
      badge: 'DISKON 50%',
    },
  };

  const currentTheme = dailyThemes[dayOfWeek] || dailyThemes[1];

  // 2. Current Flash Sale Session Notification
  let sessionTimeStr = '00:00 - 12:00 WIB';
  if (hours >= 12 && hours < 18) {
    sessionTimeStr = '12:00 - 18:00 WIB';
  } else if (hours >= 18) {
    sessionTimeStr = '18:00 - 24:00 WIB';
  }

  // 3. Realistic Relative WIB Timestamps
  const minuteNow = wib.getMinutes();
  const orderTime1 = `${String(Math.max(0, hours - 1)).padStart(2, '0')}:${String(Math.max(5, (minuteNow + 15) % 60)).padStart(2, '0')} WIB`;

  return [
    {
      id: 'notif-wib-flash',
      category: 'promo',
      titleId: `Flash Sale Sesi ${sessionTimeStr} Sedang Berlangsung!`,
      titleEn: `Flash Sale Session (${sessionTimeStr}) is LIVE Now!`,
      descId: `Diskon hingga 60% untuk produk terpopuler hari ini (${todayStrId}). Cek sebelum kuota habis!`,
      descEn: `Up to 60% OFF on today's top picks (${todayStrEn}). Grab deals before stock runs out!`,
      timestampId: 'Baru saja',
      timestampEn: 'Just now',
      isRead: false,
      discountBadge: 'FLASH SALE',
      link: '/flash-sale',
    },
    {
      id: 'notif-wib-voucher',
      category: 'voucher',
      titleId: currentTheme.titleId,
      titleEn: currentTheme.titleEn,
      descId: currentTheme.descId,
      descEn: currentTheme.descEn,
      timestampId: '15 mnt lalu',
      timestampEn: '15m ago',
      isRead: false,
      voucherCode: currentTheme.code,
      discountBadge: currentTheme.badge,
      link: '/products',
    },
    {
      id: 'notif-wib-order-transit',
      category: 'order',
      titleId: 'Paket Sedang Dikirim (J&T Express)',
      titleEn: 'Package in Transit (J&T Express)',
      descId: `Pesanan #ORD-${dateNum}9842 sedang dibawa kurir menuju alamat tujuan.`,
      descEn: `Order #ORD-${dateNum}9842 is out for delivery with the local courier.`,
      timestampId: '45 mnt lalu',
      timestampEn: '45m ago',
      isRead: false,
      orderNumber: `#ORD-${dateNum}9842`,
      courierStatusId: `J&T Express (Update: ${orderTime1})`,
      courierStatusEn: `J&T Express (Update: ${orderTime1})`,
      destination: 'Jakarta',
      link: '/orders',
    },
    {
      id: 'notif-wib-delivered',
      category: 'order',
      titleId: 'Pesanan Selesai & Diterima',
      titleEn: 'Order Delivered & Completed',
      descId: `Pesanan #ORD-${dateNum}9102 telah berhasil diterima di alamat tujuan.`,
      descEn: `Order #ORD-${dateNum}9102 was safely delivered to your address.`,
      timestampId: '3 jam lalu',
      timestampEn: '3h ago',
      isRead: true,
      orderNumber: `#ORD-${dateNum}9102`,
      courierStatusId: 'Diterima oleh Yang Bersangkutan',
      courierStatusEn: 'Received by Recipient',
      link: '/orders',
    },
    {
      id: 'notif-wib-points',
      category: 'voucher',
      titleId: 'Bonus +500 RenPoints Telah Masuk!',
      titleEn: 'Bonus +500 RenPoints Credited!',
      descId: 'Selamat! Poin reward harian Anda telah ditambahkan ke dompet akun Anda.',
      descEn: 'Congrats! Your daily loyalty reward points have been added to your balance.',
      timestampId: '5 jam lalu',
      timestampEn: '5h ago',
      isRead: true,
      discountBadge: '+500 POIN',
      link: '/profile',
    },
    {
      id: 'notif-wib-security',
      category: 'system',
      titleId: 'Aktivitas Keamanan Akun',
      titleEn: 'Account Security Activity',
      descId: `Sesi login baru terdeteksi dari peramban Anda (WIB: ${hours}:00). Status aman.`,
      descEn: `New login session detected from your browser (WIB: ${hours}:00). Account is secure.`,
      timestampId: 'Hari Ini',
      timestampEn: 'Today',
      isRead: true,
      link: '/profile',
    },
  ];
};
