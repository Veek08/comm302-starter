import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MarketSummaryCardsProps {
  assets: MarketAsset[];
  selectedSymbol: string;
  onSelectAsset: (asset: MarketAsset) => void;
  recentFlashSymbols: Record<string, 'up' | 'down'>;
}

export const MarketSummaryCards: React.FC<MarketSummaryCardsProps> = ({
  assets,
  selectedSymbol,
  onSelectAsset,
  recentFlashSymbols,
}) => {
  const [activeRegion, setActiveRegion] = useState<'us' | 'world' | 'europe' | 'asia'>('us');

  // Map regions to symbols
  const regionSymbols: Record<string, string[]> = {
    us: ['SPX', 'NDX', 'DJI', 'BTCUSD', 'XAUUSD', 'US10Y'],
    world: ['SPX', 'DAX', 'BTCUSD', 'XAUUSD', 'CL1!', 'EURUSD'],
    europe: ['DAX', 'EURUSD', 'GBPUSD', 'XAUUSD', 'CL1!', 'SPX'],
    asia: ['NDX', 'USDJPY', 'BTCUSD', 'XAUUSD', 'CL1!', 'SPX'],
  };

  const displayedSymbols = regionSymbols[activeRegion] || regionSymbols.us;
  const cardAssets = displayedSymbols
    .map((s) => assets.find((a) => a.symbol === s))
    .filter((a): a is MarketAsset => Boolean(a));

  return (
    <div className="space-y-3">
      {/* Header and Region Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722]">
            Global Markets Overview
          </h2>
          <p className="text-xs text-[#787b86]">
            Real-time equity indices, benchmark commodities, and sovereign rates
          </p>
        </div>

        {/* Region Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#1e222d] border border-[#2a2e39] rounded-lg self-start sm:self-auto theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
          {(['us', 'world', 'europe', 'asia'] as const).map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                activeRegion === region
                  ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                  : 'text-[#787b86] hover:text-[#d1d4dc] theme-light:hover:text-[#131722]'
              }`}
            >
              {region === 'us' ? 'United States' : region}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 6 interactive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cardAssets.map((asset) => {
          const isPositive = asset.change >= 0;
          const isSelected = selectedSymbol === asset.symbol;
          const flash = recentFlashSymbols[asset.symbol];

          // Calculate day range progress
          const range = asset.high24h - asset.low24h;
          const progress = range > 0 ? Math.min(100, Math.max(0, ((asset.price - asset.low24h) / range) * 100)) : 50;

          // Render Sparkline SVG
          const sparklineMin = Math.min(...asset.sparkline);
          const sparklineMax = Math.max(...asset.sparkline);
          const sparklineDelta = sparklineMax - sparklineMin || 1;
          const sparklinePoints = asset.sparkline
            .map((val, idx) => {
              const x = (idx / (asset.sparkline.length - 1)) * 120;
              const y = 36 - ((val - sparklineMin) / sparklineDelta) * 32;
              return `${x},${y}`;
            })
            .join(' ');

          const strokeColor = isPositive ? '#089981' : '#f23645';
          const fillColor = isPositive ? 'rgba(8, 153, 129, 0.15)' : 'rgba(242, 54, 69, 0.15)';

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`group relative p-3.5 rounded-xl border bg-[#1e222d] hover:border-[#2962ff]/60 hover:bg-[#222632] cursor-pointer transition-all duration-200 theme-light:bg-white theme-light:border-[#e0e3eb] theme-light:hover:bg-[#f8f9fd] ${
                isSelected
                  ? 'border-[#2962ff] ring-1 ring-[#2962ff] shadow-md shadow-[#2962ff]/10'
                  : 'border-[#2a2e39]'
              } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#d1d4dc] theme-light:text-[#131722] truncate">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] text-[#787b86] font-mono">
                      {asset.exchange}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#787b86] truncate mt-0.5">
                    {asset.name}
                  </p>
                </div>
                <button
                  aria-label={`View ${asset.symbol} chart`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Change */}
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="tabular-nums font-mono text-base font-bold text-white theme-light:text-[#131722]">
                  {asset.price.toLocaleString(undefined, {
                    minimumFractionDigits: asset.price < 10 ? 3 : 2,
                    maximumFractionDigits: asset.price < 10 ? 3 : 2,
                  })}
                </span>
                <span
                  className={`flex items-center gap-0.5 tabular-nums font-mono text-xs font-semibold ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>
                    {isPositive ? '+' : ''}
                    {asset.changePercent.toFixed(2)}%
                  </span>
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="mt-2 h-9 w-full">
                <svg viewBox="0 0 120 36" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id={`grad-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,36 ${sparklinePoints} 120,36`}
                    fill={`url(#grad-${asset.symbol})`}
                  />
                  <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                  />
                </svg>
              </div>

              {/* Day Range Bar */}
              <div className="mt-2 pt-2 border-t border-[#2a2e39] text-[10px] text-[#787b86] theme-light:border-[#e0e3eb]">
                <div className="flex justify-between tabular-nums font-mono">
                  <span>L: {asset.low24h.toLocaleString()}</span>
                  <span>H: {asset.high24h.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1 w-full bg-[#131722] rounded-full overflow-hidden theme-light:bg-[#e0e3eb]">
                  <div
                    className="h-full bg-[#2962ff] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
