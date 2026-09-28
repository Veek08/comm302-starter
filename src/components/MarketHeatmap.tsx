import React, { useState } from 'react';
import { HEATMAP_ITEMS, SECTORS_DATA } from '../data/mockMarketData';
import { HeatmapItem, SectorPerformance, MarketAsset } from '../types/market';
import { Grid, BarChart3, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MarketHeatmapProps {
  onSelectSymbol: (symbol: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ onSelectSymbol }) => {
  const [viewMode, setViewMode] = useState<'treemap' | 'sectors'>('treemap');
  const [sectorPeriod, setSectorPeriod] = useState<'today' | '1w' | '1m' | 'ytd'>('today');
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  // Helper to calculate heatmap background color based on % change
  const getTileColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-[#089981] text-white';
    if (pct >= 1.5) return 'bg-[#0b806d] text-white';
    if (pct >= 0.5) return 'bg-[#0e5c50] text-slate-200';
    if (pct > -0.5) return 'bg-[#2a2e39] text-slate-300';
    if (pct > -1.5) return 'bg-[#7c1d24] text-slate-200';
    if (pct > -3.0) return 'bg-[#ba222e] text-white';
    return 'bg-[#f23645] text-white';
  };

  // Group heatmap items by sector for structured visual layout
  const sectors = Array.from(new Set(HEATMAP_ITEMS.map((item) => item.sector)));

  return (
    <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] p-4 space-y-4 theme-light:bg-white theme-light:border-[#e0e3eb]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722] flex items-center gap-2">
            <span>Market Heatmap & Sector Breadth</span>
          </h3>
          <p className="text-xs text-[#787b86]">
            S&P 500 company performance weighted by capitalization
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#131722] border border-[#2a2e39] rounded-lg theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
          <button
            onClick={() => setViewMode('treemap')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'treemap'
                ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                : 'text-[#787b86] hover:text-[#d1d4dc] theme-light:hover:text-[#131722]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Treemap</span>
          </button>
          <button
            onClick={() => setViewMode('sectors')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'sectors'
                ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                : 'text-[#787b86] hover:text-[#d1d4dc] theme-light:hover:text-[#131722]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sectors Bar</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Treemap Grid */}
      {viewMode === 'treemap' && (
        <div className="space-y-4">
          {/* Visual Legend */}
          <div className="flex items-center justify-between text-xs text-[#787b86] border-b border-[#2a2e39] pb-2 theme-light:border-[#e0e3eb]">
            <span>Hover to inspect · Click to load in chart</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[#f23645]">-3%</span>
              <div className="flex h-2.5 w-24 rounded-full overflow-hidden">
                <div className="w-1/5 bg-[#f23645]" />
                <div className="w-1/5 bg-[#ba222e]" />
                <div className="w-1/5 bg-[#2a2e39]" />
                <div className="w-1/5 bg-[#0b806d]" />
                <div className="w-1/5 bg-[#089981]" />
              </div>
              <span className="text-[#089981]">+3%</span>
            </div>
          </div>

          {/* Grouped Sectors Treemap Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {sectors.map((secName) => {
              const secItems = HEATMAP_ITEMS.filter((i) => i.sector === secName);
              return (
                <div
                  key={secName}
                  className="rounded-lg border border-[#2a2e39] bg-[#131722]/50 p-2.5 space-y-2 theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]"
                >
                  <div className="text-[11px] font-semibold text-[#787b86] flex items-center justify-between">
                    <span className="truncate">{secName}</span>
                    <span className="text-[10px] font-mono">{secItems.length} stocks</span>
                  </div>

                  {/* Adaptive Tiles for this sector */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {secItems.map((item) => {
                      const isMega = item.marketCap > 1500;
                      return (
                        <button
                          key={item.symbol}
                          onClick={() => onSelectSymbol(item.symbol)}
                          onMouseEnter={() => setHoveredItem(item)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`relative p-2 rounded-md transition-transform hover:scale-[1.02] hover:z-10 focus:outline-none text-left flex flex-col justify-between ${
                            isMega ? 'col-span-2 py-3' : 'col-span-1'
                          } ${getTileColor(item.changePercent)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{item.symbol}</span>
                            <span className="tabular-nums font-mono text-[11px] font-semibold">
                              {item.changePercent >= 0 ? '+' : ''}
                              {item.changePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between text-[10px] opacity-80 font-mono">
                            <span className="truncate max-w-[80px]">{item.name}</span>
                            <span>${item.price.toFixed(2)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hovered Item Quick Bar */}
          {hoveredItem && (
            <div className="p-2.5 rounded-lg bg-[#131722] border border-[#2962ff]/40 flex items-center justify-between text-xs animate-fadeIn theme-light:bg-[#f0f3fa]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white theme-light:text-[#131722]">{hoveredItem.symbol}</span>
                <span className="text-[#787b86]">{hoveredItem.name} ({hoveredItem.sector})</span>
                <span className="tabular-nums font-mono text-[#d1d4dc] theme-light:text-[#131722]">${hoveredItem.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums font-mono font-bold text-white">
                  Cap: ${(hoveredItem.marketCap).toLocaleString()}B
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    hoveredItem.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {hoveredItem.changePercent >= 0 ? '+' : ''}
                  {hoveredItem.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Sector Performance Comparison Bar Table */}
      {viewMode === 'sectors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#787b86]">Ranked by relative sector strength</span>
            <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded border border-[#2a2e39] text-xs theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
              {(['today', '1w', '1m', 'ytd'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSectorPeriod(period)}
                  className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono ${
                    sectorPeriod === period
                      ? 'bg-[#2a2e39] text-white font-bold theme-light:bg-white theme-light:text-[#131722]'
                      : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {SECTORS_DATA.map((sec) => {
              const val =
                sectorPeriod === 'today'
                  ? sec.changeToday
                  : sectorPeriod === '1w'
                  ? sec.change1W
                  : sectorPeriod === '1m'
                  ? sec.change1M
                  : sec.changeYTD;

              const isPos = val >= 0;
              const barWidth = Math.min(100, Math.abs(val) * (sectorPeriod === 'ytd' ? 3 : 15));

              return (
                <div
                  key={sec.id}
                  className="p-2.5 rounded-lg bg-[#131722]/60 hover:bg-[#131722] border border-[#2a2e39] flex items-center justify-between text-xs theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]"
                >
                  <div className="w-1/3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#d1d4dc] theme-light:text-[#131722]">{sec.name}</span>
                      <span className="font-mono text-[10px] text-[#787b86]">{sec.symbol}</span>
                    </div>
                    <span className="text-[10px] text-[#787b86]">Top: {sec.topStock} ({sec.topStockChange > 0 ? '+' : ''}{sec.topStockChange}%)</span>
                  </div>

                  {/* Relative Performance Visual Bar */}
                  <div className="flex-1 mx-4 h-3 bg-[#1e222d] rounded-full overflow-hidden relative flex items-center theme-light:bg-[#e0e3eb]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPos ? 'bg-[#089981]' : 'bg-[#f23645]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Metric Value */}
                  <div className="w-20 text-right">
                    <span
                      className={`tabular-nums font-mono font-bold ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {val.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
