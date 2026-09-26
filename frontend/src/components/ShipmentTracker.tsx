import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Phone, 
  MessageCircle,
  ChevronDown, 
  ChevronUp, 
  Building2,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../types';
import { useLocale } from '../contexts/LocaleContext';

export type TrackingStage = 'order_placed' | 'picked_up' | 'drop_off' | 'sorting' | 'out_for_delivery' | 'delivered';

export interface TrackingStep {
  stage: TrackingStage;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  locationId: string;
  locationEn: string;
  timeOffsetHours: number; // For realistic timestamp generation
}

const TRACKING_STEPS_CONFIG: TrackingStep[] = [
  {
    stage: 'order_placed',
    titleId: 'Pesanan Dibuat & Pembayaran Terverifikasi',
    titleEn: 'Order Placed & Payment Verified',
    descId: 'Penjual telah menerima pesanan dan sedang mengemas produk dengan aman.',
    descEn: 'Seller has received your order and is safely packing the products.',
    locationId: 'Gudang RenStore Official, Jakarta Barat',
    locationEn: 'RenStore Official Warehouse, West Jakarta',
    timeOffsetHours: 0,
  },
  {
    stage: 'picked_up',
    titleId: 'Paket Telah di-Pickup oleh Kurir J&T Express',
    titleEn: 'Package Picked Up by J&T Express',
    descId: 'Kurir J&T Express (Sprinter) telah menjemput paket dari gudang penjual.',
    descEn: 'J&T Express Sprinter courier has picked up the package from seller warehouse.',
    locationId: 'Pickup Point RenStore Hub, Jakarta Barat',
    locationEn: 'RenStore Pickup Hub, West Jakarta',
    timeOffsetHours: 2,
  },
  {
    stage: 'drop_off',
    titleId: 'Paket Tiba di Drop Point J&T Express',
    titleEn: 'Package Arrived at J&T Drop Point',
    descId: 'Paket telah di-drop off dan dipindai masuk ke sistem logistik J&T Express.',
    descEn: 'Package dropped off and scanned into J&T Express logistics system.',
    locationId: 'Drop Point J&T Kebon Jeruk [JKT-DP01]',
    locationEn: 'J&T Kebon Jeruk Drop Point [JKT-DP01]',
    timeOffsetHours: 4,
  },
  {
    stage: 'sorting',
    titleId: 'Paket Selesai Disortir di Pusat Sortir Gateway',
    titleEn: 'Package Sorted at J&T Sorting Gateway Hub',
    descId: 'Paket telah selesai disortir dan diberangkatkan menuju Hub distribusi area tujuan.',
    descEn: 'Package sorted and dispatched to destination area distribution hub.',
    locationId: 'Pusat Sortir Gateway J&T Rawamangun [JKT-GATEWAY]',
    locationEn: 'J&T Rawamangun Sorting Gateway [JKT-GATEWAY]',
    timeOffsetHours: 8,
  },
  {
    stage: 'out_for_delivery',
    titleId: 'Paket Sedang Dikirim oleh Kurir ke Alamat Tujuan',
    titleEn: 'Package Out for Delivery by Courier',
    descId: 'Kurir J&T Express (Bpk. Ahmad Riyadi - 0812-9876-5432) sedang mengantar paket ke alamat Anda.',
    descEn: 'J&T Courier (Mr. Ahmad Riyadi - 0812-9876-5432) is delivering to your address.',
    locationId: 'Area Pengantaran Terakhir, Kota Tujuan',
    locationEn: 'Final Delivery Area, Destination City',
    timeOffsetHours: 12,
  },
  {
    stage: 'delivered',
    titleId: 'Paket Telah Berhasil Diterima',
    titleEn: 'Package Delivered Successfully',
    descId: 'Paket telah diterima di alamat tujuan oleh penerima yang bersangkutan.',
    descEn: 'Package was successfully received at destination address by recipient.',
    locationId: 'Alamat Tujuan Penerima',
    locationEn: 'Recipient Destination Address',
    timeOffsetHours: 14,
  },
];

interface ShipmentTrackerProps {
  order: Order;
  initialStage?: TrackingStage;
  isCompact?: boolean;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ 
  order, 
  initialStage,
  isCompact = false 
}) => {
  const { language } = useLocale();
  const [copiedResi, setCopiedResi] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(!isCompact);

  // Derive current stage based on order status or fallback
  const determineDefaultStage = (): TrackingStage => {
    if (initialStage) return initialStage;
    if (order.status === 'completed') return 'delivered';
    if (order.status === 'processing') return 'out_for_delivery';
    if (order.payment_status === 'paid') return 'sorting';
    return 'order_placed';
  };

  const currentStage: TrackingStage = determineDefaultStage();

  // Generate consistent J&T Tracking Waybill (Resi) from order number
  const jntTrackingNumber = `JX${order.order_number.replace(/[^0-9]/g, '').padStart(10, '829104') || '8492019482'}ID`;

  const stageOrder: TrackingStage[] = [
    'order_placed',
    'picked_up',
    'drop_off',
    'sorting',
    'out_for_delivery',
    'delivered',
  ];

  const currentStageIndex = stageOrder.indexOf(currentStage);

  const handleCopyResi = () => {
    navigator.clipboard.writeText(jntTrackingNumber);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const formatStageTime = (timeOffsetHours: number) => {
    const baseDate = new Date(order.created_at || Date.now());
    const eventDate = new Date(baseDate.getTime() + timeOffsetHours * 3600 * 1000);
    
    const formatted = eventDate.toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatted} WIB`;
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
      {/* Top Courier Header Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-red-500/5 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-red-600/25 shrink-0">
            J&amp;T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                J&amp;T Express (EZ)
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'en' ? 'Waybill (Resi):' : 'No. Resi:'}
              </span>
              <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                {jntTrackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyResi}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title={language === 'en' ? 'Copy Waybill Number' : 'Salin Nomor Resi'}
              >
                {copiedResi ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shopee & TikTok Shop-Style Stepper Progress Bar */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        <div className="relative">
          {/* Horizontal Connecting Line (Desktop) - Precisely anchored to circle centers */}
          <div className="hidden md:block absolute top-[27px] left-[calc(100%/12)] right-[calc(100%/12)] h-1.5 bg-slate-200 rounded-full -z-0">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${(currentStageIndex / (stageOrder.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-2 relative z-10">
            {TRACKING_STEPS_CONFIG.map((step, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div 
                  key={step.stage} 
                  className="flex flex-col items-center text-center p-2 transition-all"
                >
                  {/* Step Icon Capsule - Bold Green & Distinct Status */}
                  <div 
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs transition-all mb-2 ${
                      isCurrent
                        ? 'bg-red-600 text-white shadow-xl shadow-red-600/35 ring-4 ring-red-200 ring-offset-2 ring-offset-slate-50 scale-110'
                        : isPast
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 ring-4 ring-emerald-200'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5 stroke-[4] text-white" />
                    ) : idx === 0 ? (
                      <Package className="w-5 h-5 stroke-[3]" />
                    ) : idx === 1 ? (
                      <Truck className="w-5 h-5 stroke-[3]" />
                    ) : idx === 2 ? (
                      <Building2 className="w-5 h-5 stroke-[3]" />
                    ) : idx === 3 ? (
                      <Navigation className="w-5 h-5 stroke-[3]" />
                    ) : idx === 4 ? (
                      <Truck className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                    )}
                  </div>

                  <span className={`text-xs leading-tight line-clamp-2 ${
                    isCurrent 
                      ? 'text-red-600 font-black' 
                      : isPast 
                      ? 'text-slate-900 font-black' 
                      : 'text-slate-400 font-bold'
                  }`}>
                    {idx === 0
                      ? language === 'en' ? 'Order Paid' : 'Dibayar'
                      : idx === 1
                      ? language === 'en' ? 'Picked Up' : 'Di-Pickup'
                      : idx === 2
                      ? language === 'en' ? 'Drop Off' : 'Drop Off'
                      : idx === 3
                      ? language === 'en' ? 'Sorting Hub' : 'Disortir'
                      : idx === 4
                      ? language === 'en' ? 'On Courier' : 'Diantar'
                      : language === 'en' ? 'Delivered' : 'Diterima'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Courier Profile & WhatsApp Info Card (Prominently displayed) */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-white to-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/25 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {language === 'en' ? 'J&T Sprinter Courier' : 'Kurir J&T Pengantar'}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
              Ahmad Riyadi
            </h4>
            <p className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1.5">
              <span>WA / Telp: 0812-9876-5432</span>
            </p>
          </div>
        </div>

        {/* WhatsApp & Call Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={`https://wa.me/6281298765432?text=${encodeURIComponent(
              language === 'en'
                ? `Hello Mr. Ahmad Riyadi (J&T Courier), I would like to check on my RenStore package with tracking number ${jntTrackingNumber}.`
                : `Halo Mas Ahmad Riyadi (Kurir J&T), saya ingin menanyakan update pengiriman paket RenStore dengan No. Resi ${jntTrackingNumber}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Chat WhatsApp</span>
          </a>

          <a
            href="tel:081298765432"
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-colors"
            title={language === 'en' ? 'Call Courier' : 'Telepon Kurir'}
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
          </a>
        </div>
      </div>

      {/* Location & Live Status Summary Card */}
      <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Latest Checkpoint & Location' : 'Lokasi Terkini Paket'}
            </span>
            <p className="text-xs sm:text-sm font-black text-slate-900">
              {language === 'en'
                ? TRACKING_STEPS_CONFIG[currentStageIndex].locationEn
                : TRACKING_STEPS_CONFIG[currentStageIndex].locationId}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? TRACKING_STEPS_CONFIG[currentStageIndex].descEn
                : TRACKING_STEPS_CONFIG[currentStageIndex].descId}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Tracking Logs / Timeline History (Collapsible) */}
      <div className="bg-slate-50/70 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full flex items-center justify-between text-xs font-black text-slate-800 hover:text-blue-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            {language === 'en' ? 'Complete Shipment Tracking History' : 'Riwayat Lengkap Perjalanan Paket J&T'}
          </span>
          {isHistoryExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {isHistoryExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 space-y-4"
            >
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {TRACKING_STEPS_CONFIG.slice(0, currentStageIndex + 1).reverse().map((step, idx) => {
                  const isLatest = idx === 0;

                  return (
                    <div key={step.stage} className="relative group">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 transition-all ${
                        isLatest
                          ? 'bg-red-600 border-white ring-4 ring-red-100 scale-125'
                          : 'bg-slate-400 border-white'
                      }`} />

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className={`text-xs font-black ${isLatest ? 'text-red-600' : 'text-slate-800'}`}>
                            {language === 'en' ? step.titleEn : step.titleId}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatStageTime(step.timeOffsetHours)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {language === 'en' ? step.descEn : step.descId}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {language === 'en' ? step.locationEn : step.locationId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShipmentTracker;
