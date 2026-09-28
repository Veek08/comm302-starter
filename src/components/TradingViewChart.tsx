import React, { useState, useMemo, useRef } from 'react';
import { MarketAsset, Candle } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  DollarSign,
  Info,
  CheckCircle,
  Sliders,
  Activity,
  Layers,
} from 'lucide-react';

interface TradingViewChartProps {
  asset: MarketAsset;
  onTradeExecuted?: (symbol: string, side: 'BUY' | 'SELL', amount: number, price: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

type ChartType = 'candles' | 'area' | 'bars' | 'heikin';
type Timeframe = '1D' | '5D' | '1M' | '1Y';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  asset,
  onTradeExecuted,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [showMA20, setShowMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Paper trade state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Candles for the selected timeframe
  const candles: Candle[] = useMemo(() => {
    return asset.historicalCandles[timeframe] || asset.historicalCandles['1D'] || [];
  }, [asset, timeframe]);

  // Price calculations
  const { minPrice, maxPrice, minVol, maxVol, ma20Points, ema50Points, upperBBPoints, lowerBBPoints } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 1, minVol: 0, maxVol: 1, ma20Points: [], ema50Points: [], upperBBPoints: [], lowerBBPoints: [] };
    
    let low = Infinity;
    let high = -Infinity;
    let highVol = 0;

    candles.forEach((c) => {
      if (c.low < low) low = c.low;
      if (c.high > high) high = c.high;
      if (c.volume > highVol) highVol = c.volume;
    });

    const padding = (high - low) * 0.08;
    const finalMin = Math.max(0, low - padding);
    const finalMax = high + padding;

    // Moving average lines
    const ma20: (number | null)[] = [];
    const ema50: (number | null)[] = [];
    const upperBB: (number | null)[] = [];
    const lowerBB: (number | null)[] = [];

    for (let i = 0; i < candles.length; i++) {
      // 7-period moving average for responsive preview
      const period = Math.min(i + 1, 7);
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
      ma20.push(avg);

      // Std dev for Bollinger
      const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - avg, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upperBB.push(avg + stdDev * 1.8);
      lowerBB.push(avg - stdDev * 1.8);

      // 14-period EMA approximate
      const periodEma = Math.min(i + 1, 14);
      const sliceEma = candles.slice(i - periodEma + 1, i + 1);
      const avgEma = sliceEma.reduce((acc, curr) => acc + curr.close, 0) / periodEma;
      ema50.push(avgEma * 0.998); // slight offset for visual layering
    }

    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      minVol: 0,
      maxVol: highVol * 1.4,
      ma20Points: ma20,
      ema50Points: ema50,
      upperBBPoints: upperBB,
      lowerBBPoints: lowerBB,
    };
  }, [candles]);

  // Active display candle is hovered candle or latest candle
  const activeCandle = hoveredCandle || candles[candles.length - 1] || {
    open: asset.price,
    high: asset.high24h,
    low: asset.low24h,
    close: asset.price,
    volume: 1200000,
    time: 'Current',
  };

  const isPositive = asset.change >= 0;

  // Chart rendering geometry
  const chartWidth = 900;
  const chartHeight = showRSI ? 340 : 420;
  const rsiHeight = 80;
  const candleCount = candles.length;
  const candleSpacing = chartWidth / Math.max(1, candleCount);
  const candleBodyWidth = Math.max(2, Math.min(14, candleSpacing * 0.7));

  const getY = (val: number) => {
    const range = maxPrice - minPrice || 1;
    return chartHeight - ((val - minPrice) / range) * (chartHeight - 40) - 20;
  };

  const getVolY = (vol: number) => {
    const range = maxVol || 1;
    const volHeight = 70;
    return chartHeight - (vol / range) * volHeight;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalizing to chart viewBox
    const normalizedX = (mouseX / rect.width) * chartWidth;
    const candleIndex = Math.floor(normalizedX / candleSpacing);

    if (candleIndex >= 0 && candleIndex < candles.length) {
      setHoveredCandle(candles[candleIndex]);
      setCrosshairPos({
        x: candleIndex * candleSpacing + candleSpacing / 2,
        y: mouseY,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setCrosshairPos(null);
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTradeExecuted) {
      onTradeExecuted(asset.symbol, orderSide, tradeQuantity, asset.price);
    }
    setOrderSuccessMessage(`Simulated order filled: ${orderSide} ${tradeQuantity} ${asset.symbol} @ $${asset.price.toLocaleString()}`);
    setTimeout(() => {
      setOrderSuccessMessage(null);
      setShowTradeModal(false);
    }, 2000);
  };

  // Convert points array to SVG path
  const ma20Path = ma20Points
    .map((val, i) => (val !== null ? `${i * candleSpacing + candleSpacing / 2},${getY(val)}` : ''))
    .filter(Boolean)
    .join(' L ');

  const ema50Path = ema50Points
    .map((val, i) => (val !== null ? `${i * candleSpacing + candleSpacing / 2},${getY(val)}` : ''))
    .filter(Boolean)
    .join(' L ');

  // Area path
  const areaPoints = candles.map((c, i) => `${i * candleSpacing + candleSpacing / 2},${getY(c.close)}`).join(' L ');
  const areaSvgPath = `M ${candles.length ? `0,${chartHeight}` : ''} L ${areaPoints} L ${chartWidth},${chartHeight} Z`;

  return (
    <div
      className={`rounded-xl border border-[#2a2e39] bg-[#1e222d] overflow-hidden transition-all duration-300 theme-light:bg-white theme-light:border-[#e0e3eb] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#131722]' : ''
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#2a2e39] theme-light:border-[#e0e3eb]">
        {/* Symbol Meta & Quick Price */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2962ff]/10 border border-[#2962ff]/30 flex items-center justify-center font-bold text-sm text-[#2962ff]">
            {asset.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#d1d4dc] theme-light:text-[#131722]">
                {asset.symbol}
              </span>
              <span className="text-xs text-[#787b86] font-mono">
                {asset.exchange} · {asset.category.toUpperCase()}
              </span>
              <button
                onClick={() => onToggleWatchlist(asset.symbol)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  isInWatchlist
                    ? 'border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
                    : 'border-[#2a2e39] text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
                }`}
              >
                {isInWatchlist ? '★ In Watchlist' : '+ Watchlist'}
              </button>
            </div>
            <p className="text-xs text-[#787b86] truncate max-w-sm">
              {asset.name}
            </p>
          </div>
        </div>

        {/* Real-time Price and Delta */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="tabular-nums font-mono text-xl font-bold text-white theme-light:text-[#131722]">
              ${asset.price.toLocaleString(undefined, {
                minimumFractionDigits: asset.price < 10 ? 4 : 2,
                maximumFractionDigits: asset.price < 10 ? 4 : 2,
              })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 tabular-nums font-mono text-xs font-semibold ${
                isPositive ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? '+' : ''}
                {asset.change.toFixed(2)} ({isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Quick Paper Trade Button */}
          <button
            onClick={() => setShowTradeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Paper Trade</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Chart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#161922] border-b border-[#2a2e39] text-xs theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1">
          {(['1D', '5D', '1M', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-[#2962ff] text-white font-semibold'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39] theme-light:hover:text-[#131722]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Selector */}
        <div className="flex items-center gap-1 border-l border-[#2a2e39] pl-2 theme-light:border-[#e0e3eb]">
          <button
            onClick={() => setChartType('candles')}
            className={`px-2 py-1 rounded transition-colors ${
              chartType === 'candles' ? 'bg-[#2a2e39] text-white font-semibold theme-light:bg-[#e0e3eb] theme-light:text-[#131722]' : 'text-[#787b86] hover:text-white'
            }`}
            title="Candlestick Chart"
          >
            Candles
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-2 py-1 rounded transition-colors ${
              chartType === 'area' ? 'bg-[#2a2e39] text-white font-semibold theme-light:bg-[#e0e3eb] theme-light:text-[#131722]' : 'text-[#787b86] hover:text-white'
            }`}
            title="Area Chart"
          >
            Area
          </button>
        </div>

        {/* Technical Overlays Toggles */}
        <div className="flex items-center gap-2 border-l border-[#2a2e39] pl-2 overflow-x-auto no-scrollbar theme-light:border-[#e0e3eb]">
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showMA20
                ? 'border-[#2962ff]/60 bg-[#2962ff]/10 text-[#2962ff]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#2962ff] rounded inline-block" />
            <span>MA 20</span>
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showEMA50
                ? 'border-[#f59e0b]/60 bg-[#f59e0b]/10 text-[#f59e0b]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#f59e0b] rounded inline-block" />
            <span>EMA 50</span>
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showBollinger
                ? 'border-[#8b5cf6]/60 bg-[#8b5cf6]/10 text-[#8b5cf6]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <span>BB (20,2)</span>
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
              showRSI
                ? 'border-[#089981]/60 bg-[#089981]/10 text-[#089981]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            <span>RSI (14)</span>
          </button>
        </div>
      </div>

      {/* 3. OHLC Hover Bar Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-1.5 bg-[#131722] text-[11px] font-mono text-[#787b86] border-b border-[#2a2e39] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
        <div className="flex items-center gap-2">
          <span>Time: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{activeCandle.time}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>O: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{activeCandle.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-[#089981]">{activeCandle.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-[#f23645]">{activeCandle.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{activeCandle.close.toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{(activeCandle.volume / 1000000).toFixed(2)}M</strong></span>
        </div>
      </div>

      {/* 4. Main SVG Interactive Chart Area */}
      <div
        ref={chartContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full cursor-crosshair select-none bg-[#131722] theme-light:bg-white"
        style={{ height: isFullscreen ? 'calc(100vh - 220px)' : '460px' }}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
            </linearGradient>
            <pattern id="gridPattern" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#20242e" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width={chartWidth} height={chartHeight} fill="url(#gridPattern)" />

          {/* Price Axis Horizontal Lines & Reference Labels */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = chartHeight * ratio;
            const price = maxPrice - (ratio * (maxPrice - minPrice));
            return (
              <g key={ratio}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#20242e" strokeDasharray="3 3" />
                <text
                  x={chartWidth - 10}
                  y={y - 4}
                  fill="#787b86"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Fill */}
          {showBollinger && upperBBPoints.length > 0 && (
            <path
              d={`M ${upperBBPoints.map((val, i) => val !== null ? `${i * candleSpacing + candleSpacing / 2},${getY(val)}` : '').filter(Boolean).join(' L ')} L ${lowerBBPoints.slice().reverse().map((val, i) => val !== null ? `${(lowerBBPoints.length - 1 - i) * candleSpacing + candleSpacing / 2},${getY(val)}` : '').filter(Boolean).join(' L ')} Z`}
              fill="rgba(139, 92, 246, 0.08)"
            />
          )}

          {/* Volume Histogram */}
          {candles.map((c, i) => {
            const x = i * candleSpacing + candleSpacing / 2;
            const volY = getVolY(c.volume);
            const isUp = c.close >= c.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleBodyWidth / 2}
                y={volY}
                width={candleBodyWidth}
                height={chartHeight - volY}
                fill={isUp ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)'}
              />
            );
          })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              <path d={areaSvgPath} fill="url(#areaGradient)" />
              <path
                d={`M ${areaPoints}`}
                fill="none"
                stroke="#2962ff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candles' &&
            candles.map((c, i) => {
              const x = i * candleSpacing + candleSpacing / 2;
              const isUp = c.close >= c.open;
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const bodyY = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
              const color = isUp ? '#089981' : '#f23645';

              return (
                <g key={`candle-${i}`}>
                  {/* Upper and Lower Wicks */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleBodyWidth / 2}
                    y={bodyY}
                    width={candleBodyWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="0.5"
                    rx="0.5"
                  />
                </g>
              );
            })}

          {/* Indicator Lines */}
          {showMA20 && ma20Path && (
            <path
              d={`M ${ma20Path}`}
              fill="none"
              stroke="#2962ff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}

          {showEMA50 && ema50Path && (
            <path
              d={`M ${ema50Path}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}

          {/* Interactive Crosshair Lines */}
          {crosshairPos && (
            <g>
              {/* Vertical line */}
              <line
                x1={crosshairPos.x}
                y1={0}
                x2={crosshairPos.x}
                y2={chartHeight}
                stroke="#787b86"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Horizontal line */}
              <line
                x1={0}
                y1={crosshairPos.y}
                x2={chartWidth}
                y2={crosshairPos.y}
                stroke="#787b86"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>

        {/* RSI Sub-pane if toggled */}
        {showRSI && (
          <div className="h-20 border-t border-[#2a2e39] bg-[#161922] px-4 py-1 relative theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
            <div className="flex items-center justify-between text-[10px] text-[#787b86]">
              <span className="font-semibold text-[#089981]">RSI (14): {asset.technicalSummary.rsi}</span>
              <span>Overbought 70 / Oversold 30</span>
            </div>
            <div className="relative h-12 w-full mt-1">
              <div className="absolute top-1/4 w-full border-b border-[#2a2e39] border-dashed" />
              <div className="absolute top-3/4 w-full border-b border-[#2a2e39] border-dashed" />
              <div
                className="h-full w-full bg-gradient-to-r from-[#2962ff]/20 via-[#089981]/30 to-[#2962ff]/20 rounded opacity-60"
                style={{ clipPath: 'polygon(0% 50%, 20% 40%, 40% 65%, 60% 30%, 80% 45%, 100% 38%, 100% 100%, 0% 100%)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Technical Analysis & Key Statistics Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#2a2e39] border-t border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:divide-[#e0e3eb] theme-light:border-[#e0e3eb]">
        {/* Sentiment Meter (TradingView gauge) */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#787b86]">Technical Rating</div>
            <div
              className={`text-base font-bold ${
                asset.technicalSummary.sentiment.includes('Buy')
                  ? 'text-[#089981]'
                  : asset.technicalSummary.sentiment.includes('Sell')
                  ? 'text-[#f23645]'
                  : 'text-[#f59e0b]'
              }`}
            >
              {asset.technicalSummary.sentiment}
            </div>
            <div className="text-[11px] text-[#787b86] mt-0.5">
              {asset.technicalSummary.buyCount} Buy · {asset.technicalSummary.neutralCount} Neutral · {asset.technicalSummary.sellCount} Sell
            </div>
          </div>

          {/* Mini Gauge Needle Graphic */}
          <div className="w-24 h-14 relative flex items-center justify-center">
            <svg viewBox="0 0 100 55" className="w-full h-full">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#2a2e39"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 35 20"
                fill="none"
                stroke="#f23645"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 35 20 A 40 40 0 0 1 65 20"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="8"
              />
              <path
                d="M 65 20 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#089981"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={50 + 32 * Math.cos(Math.PI - ((asset.technicalSummary.score + 100) / 200) * Math.PI)}
                y2={50 - 32 * Math.sin(Math.PI - ((asset.technicalSummary.score + 100) / 200) * Math.PI)}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="4" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Fundamental Statistics Grid */}
        <div className="p-4 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[#787b86] block text-[10px]">Market Cap</span>
            <span className="tabular-nums font-mono font-semibold text-[#d1d4dc] theme-light:text-[#131722]">{asset.marketCap}</span>
          </div>
          <div>
            <span className="text-[#787b86] block text-[10px]">24h Volume</span>
            <span className="tabular-nums font-mono font-semibold text-[#d1d4dc] theme-light:text-[#131722]">{asset.volume}</span>
          </div>
          <div>
            <span className="text-[#787b86] block text-[10px]">P/E Ratio</span>
            <span className="tabular-nums font-mono font-semibold text-[#d1d4dc] theme-light:text-[#131722]">{asset.peRatio ? asset.peRatio.toFixed(1) : '—'}</span>
          </div>
          <div>
            <span className="text-[#787b86] block text-[10px]">24h Low</span>
            <span className="tabular-nums font-mono text-[#f23645]">{asset.low24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#787b86] block text-[10px]">24h High</span>
            <span className="tabular-nums font-mono text-[#089981]">{asset.high24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#787b86] block text-[10px]">Dividend</span>
            <span className="tabular-nums font-mono text-[#d1d4dc] theme-light:text-[#131722]">{asset.dividendYield ? `${asset.dividendYield}%` : '—'}</span>
          </div>
        </div>

        {/* About Asset Description */}
        <div className="p-4 text-xs text-[#787b86] flex flex-col justify-between">
          <p className="line-clamp-2 text-[11px] leading-relaxed">
            {asset.description}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1 border-t border-[#2a2e39] theme-light:border-[#e0e3eb]">
            <span>Sector: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{asset.sector || 'Broad Market'}</strong></span>
            <span>Beta: <strong className="text-[#d1d4dc] theme-light:text-[#131722]">{asset.beta || 1.0}</strong></span>
          </div>
        </div>
      </div>

      {/* Paper Trading Execution Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#1e222d] border border-[#2a2e39] p-5 shadow-2xl text-[#d1d4dc] theme-light:bg-white theme-light:border-[#e0e3eb] theme-light:text-[#131722]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39] theme-light:border-[#e0e3eb]">
              <div>
                <h3 className="font-bold text-base">Paper Trading Order</h3>
                <p className="text-xs text-[#787b86]">Simulated execution for {asset.symbol}</p>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-[#787b86] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccessMessage ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-[#089981] mx-auto" />
                <p className="font-semibold text-sm text-[#089981]">{orderSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteTrade} className="mt-4 space-y-4">
                {/* Order Type Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#131722] rounded-lg border border-[#2a2e39] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
                  <button
                    type="button"
                    onClick={() => setOrderSide('BUY')}
                    className={`py-2 text-xs font-bold rounded-md transition-colors ${
                      orderSide === 'BUY'
                        ? 'bg-[#089981] text-white shadow'
                        : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSide('SELL')}
                    className={`py-2 text-xs font-bold rounded-md transition-colors ${
                      orderSide === 'SELL'
                        ? 'bg-[#f23645] text-white shadow'
                        : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    SELL / SHORT
                  </button>
                </div>

                {/* Price Display */}
                <div>
                  <label className="block text-xs text-[#787b86] mb-1">Execution Price (Market)</label>
                  <div className="tabular-nums font-mono text-base font-semibold px-3 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-xs text-[#787b86] mb-1">Units / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full tabular-nums font-mono text-sm px-3 py-2 rounded-lg bg-[#131722] border border-[#2a2e39] text-white focus:outline-none focus:border-[#2962ff] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#131722]"
                  />
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center py-2 border-t border-[#2a2e39] text-xs theme-light:border-[#e0e3eb]">
                  <span className="text-[#787b86]">Total Estimated Order Value:</span>
                  <span className="tabular-nums font-mono font-bold text-white theme-light:text-[#131722]">
                    ${(asset.price * tradeQuantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-lg text-white font-bold text-xs shadow-md transition-all active:scale-95 ${
                    orderSide === 'BUY' ? 'bg-[#089981] hover:bg-[#078873]' : 'bg-[#f23645] hover:bg-[#d92c3a]'
                  }`}
                >
                  Place {orderSide} Order for {asset.symbol}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
