import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SalesPeriodData } from '../../types';
import {
  TrendingUp,
  Calendar,
  Clock,
  SlidersHorizontal
} from 'lucide-react';

interface RealtimeLineChartProps {
  data: SalesPeriodData[];
  selectedPeriod: 'today' | '7days' | '6months' | 'yearly';
  onPeriodChange: (period: 'today' | '7days' | '6months' | 'yearly') => void;
  metricFilter: 'all' | 'revenue' | 'volume';
  onMetricFilterChange: (filter: 'all' | 'revenue' | 'volume') => void;
  formatPrice: (price: number | string | undefined) => string;
}

export const RealtimeLineChart: React.FC<RealtimeLineChartProps> = ({
  data,
  selectedPeriod,
  onPeriodChange,
  metricFilter,
  onMetricFilterChange,
  formatPrice,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Canvas Dimensions
  const svgWidth = 840;
  const svgHeight = 290;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 45;
  const padBottom = 45;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Max calculations with headroom so peak nodes never touch the ceiling
  const maxRevenue = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => Number(d.total_sales) || 0), 0);
    if (maxVal <= 0) return 1000000;
    // Add 15% headroom and round to clean number
    const target = maxVal * 1.15;
    const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
    return Math.ceil(target / magnitude) * magnitude;
  }, [data]);

  const maxOrders = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => Number(d.orders_count) || 0), 0);
    return maxVal <= 0 ? 5 : Math.max(Math.ceil(maxVal * 1.2), 5);
  }, [data]);

  // Compute 2D coordinates for revenue and volume lines
  const { revenuePoints, volumePoints, pointData } = useMemo(() => {
    if (data.length === 0) {
      return { revenuePoints: [], volumePoints: [], pointData: [] };
    }

    const count = data.length;
    const stepX = count > 1 ? chartWidth / (count - 1) : chartWidth / 2;

    const revPts: { x: number; y: number }[] = [];
    const volPts: { x: number; y: number }[] = [];
    const pts = data.map((item, idx) => {
      const x = count === 1 ? padLeft + chartWidth / 2 : padLeft + idx * stepX;

      const salesVal = Number(item.total_sales) || 0;
      const ordersVal = Number(item.orders_count) || 0;

      // Inverted Y (SVG 0 is top)
      const revY = padTop + chartHeight - (salesVal / maxRevenue) * chartHeight;
      const volY = padTop + chartHeight - (ordersVal / maxOrders) * chartHeight;

      revPts.push({ x, y: Math.max(padTop, Math.min(padTop + chartHeight, revY)) });
      volPts.push({ x, y: Math.max(padTop, Math.min(padTop + chartHeight, volY)) });

      return {
        ...item,
        x,
        revY,
        volY,
        salesVal,
        ordersVal,
      };
    });

    return { revenuePoints: revPts, volumePoints: volPts, pointData: pts };
  }, [data, chartWidth, chartHeight, padLeft, padTop, maxRevenue, maxOrders]);

  // Cubic Bézier curve generator for smooth line chart
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const revenueLinePath = useMemo(() => createSmoothPath(revenuePoints), [revenuePoints]);
  const volumeLinePath = useMemo(() => createSmoothPath(volumePoints), [volumePoints]);

  const revenueAreaPath = useMemo(() => {
    if (revenuePoints.length === 0) return '';
    const last = revenuePoints[revenuePoints.length - 1];
    const first = revenuePoints[0];
    const baseLine = padTop + chartHeight;
    return `${revenueLinePath} L ${last.x},${baseLine} L ${first.x},${baseLine} Z`;
  }, [revenueLinePath, revenuePoints, padTop, chartHeight]);

  const volumeAreaPath = useMemo(() => {
    if (volumePoints.length === 0) return '';
    const last = volumePoints[volumePoints.length - 1];
    const first = volumePoints[0];
    const baseLine = padTop + chartHeight;
    return `${volumeLinePath} L ${last.x},${baseLine} L ${first.x},${baseLine} Z`;
  }, [volumeLinePath, volumePoints, padTop, chartHeight]);

  // Grid Y-Axis steps (4 horizontal guide lines)
  const yTicks = [0, 0.33, 0.66, 1];

  // Active hover item for tooltip
  const activeItem = hoveredIndex !== null && pointData[hoveredIndex] ? pointData[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Chart Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Statistik & Analisis Tren
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </h2>
            </div>
          </div>

          {/* Metric View Pills */}
          <div className="flex items-center gap-2 mt-3.5">
            <button
              type="button"
              onClick={() => onMetricFilterChange('all')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Semua Metrik</span>
            </button>

            <button
              type="button"
              onClick={() => onMetricFilterChange('revenue')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricFilter === 'revenue'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs"></span>
              <span>Income Growth</span>
            </button>

            <button
              type="button"
              onClick={() => onMetricFilterChange('volume')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricFilter === 'volume'
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
              <span>Order Volume</span>
            </button>
          </div>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-semibold self-start lg:self-auto overflow-x-auto max-w-full shadow-2xs">
          <button
            type="button"
            onClick={() => onPeriodChange('today')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${selectedPeriod === 'today'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Hari Ini (24 Jam)
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('7days')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${selectedPeriod === '7days'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('6months')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${selectedPeriod === '6months'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            6 Bulan
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('yearly')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${selectedPeriod === 'yearly'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Modern Interactive SVG Line Chart */}
      <div className="relative w-full bg-white rounded-2xl border border-slate-100 p-2 sm:p-4 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 sm:h-72 overflow-visible"
        >
          <defs>
            {/* Income Gradient Fill (Electric Blue) */}
            <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Volume Gradient Fill (Emerald Green) */}
            <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Filter for glowing lines & dots */}
            <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.3" />
            </filter>
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Value Labels */}
          {yTicks.map((tickRatio, idx) => {
            const yPos = padTop + chartHeight - tickRatio * chartHeight;
            const revenueVal = Math.round(maxRevenue * tickRatio);

            // Format clean compact label (e.g. 1.5M or 500k)
            let formattedLabel = '0';
            if (revenueVal >= 1000000) {
              formattedLabel = (revenueVal / 1000000).toFixed(revenueVal % 1000000 === 0 ? 0 : 1) + 'M';
            } else if (revenueVal >= 1000) {
              formattedLabel = Math.round(revenueVal / 1000) + 'k';
            }

            return (
              <g key={idx} className="transition-all duration-300">
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={svgWidth - padRight}
                  y2={yPos}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray={idx === 0 ? 'none' : '4 4'}
                />
                <text
                  x={padLeft - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono font-semibold fill-slate-400"
                >
                  {formattedLabel}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <AnimatePresence>
            {(metricFilter === 'all' || metricFilter === 'revenue') && revenueAreaPath && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                d={revenueAreaPath}
                fill="url(#incomeAreaGradient)"
              />
            )}
            {(metricFilter === 'all' || metricFilter === 'volume') && volumeAreaPath && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                d={volumeAreaPath}
                fill="url(#volumeAreaGradient)"
              />
            )}
          </AnimatePresence>

          {/* Smooth Line Curves */}
          {(metricFilter === 'all' || metricFilter === 'revenue') && revenueLinePath && (
            <motion.path
              d={revenueLinePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowBlue)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {(metricFilter === 'all' || metricFilter === 'volume') && volumeLinePath && (
            <motion.path
              d={volumeLinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray={metricFilter === 'all' ? '6 4' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowGreen)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {/* Vertical Guide Line on Hover */}
          {activeItem && (
            <line
              x1={activeItem.x}
              y1={padTop}
              x2={activeItem.x}
              y2={padTop + chartHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="transition-all duration-150"
            />
          )}

          {/* Interactive Data Nodes & Hover Targets */}
          {pointData.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible larger hover trigger area */}
                <rect
                  x={pt.x - 25}
                  y={padTop}
                  width="50"
                  height={chartHeight + padBottom}
                  fill="transparent"
                />

                {/* Income Growth Node */}
                {(metricFilter === 'all' || metricFilter === 'revenue') && (
                  <g>
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.revY}
                        r="10"
                        fill="#3b82f6"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.revY}
                      r={isHovered ? "6.5" : "4"}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth={isHovered ? "3.5" : "2.5"}
                      className="transition-all duration-200"
                    />
                  </g>
                )}

                {/* Order Volume Node */}
                {(metricFilter === 'all' || metricFilter === 'volume') && (
                  <g>
                    <circle
                      cx={pt.x}
                      cy={pt.volY}
                      r={isHovered ? "5.5" : "3.5"}
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />
                  </g>
                )}

                {/* X-Axis Period Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                    }`}
                >
                  {pt.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Glassmorphism Tooltip on Hover with Smart Adaptive Placement */}
        <AnimatePresence>
          {activeItem && (() => {
            // Check if point is near top of chart -> if so, place tooltip below point so it never cuts off
            const isNearTop = activeItem.revY < svgHeight * 0.45;
            // Check if point is near right edge -> align towards left
            const isNearRight = activeItem.x > svgWidth * 0.72;
            const isNearLeft = activeItem.x < svgWidth * 0.28;

            const xPercent = (activeItem.x / svgWidth) * 100;
            const yPercent = (activeItem.revY / svgHeight) * 100;

            const horizontalTranslate = isNearRight
              ? '-translate-x-[92%]'
              : isNearLeft
                ? '-translate-x-[8%]'
                : '-translate-x-1/2';

            const verticalTranslate = isNearTop
              ? 'translate-y-4'
              : '-translate-y-full -translate-y-3';

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                }}
                className={`absolute ${horizontalTranslate} ${verticalTranslate} pointer-events-none z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/90 min-w-[190px]`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    {selectedPeriod === 'today' ? (
                      <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                    {activeItem.period}
                  </span>
                  {activeItem.date && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeItem.date}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {(metricFilter === 'all' || metricFilter === 'revenue') && (
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-xs" />
                        Pendapatan:
                      </span>
                      <span className="font-mono font-extrabold text-white">
                        {formatPrice(activeItem.salesVal)}
                      </span>
                    </div>
                  )}

                  {(metricFilter === 'all' || metricFilter === 'volume') && (
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-xs" />
                        Total Order:
                      </span>
                      <span className="font-bold text-emerald-400">
                        {activeItem.ordersVal} transaksi
                      </span>
                    </div>
                  )}

                  {activeItem.completed_count !== undefined && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
                      <span>Order Selesai:</span>
                      <span className="font-semibold text-slate-200">
                        {activeItem.completed_count} dari {activeItem.ordersVal}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RealtimeLineChart;
