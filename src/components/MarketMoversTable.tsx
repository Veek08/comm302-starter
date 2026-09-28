import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown, Star, ArrowUpDown, Search, BarChart2 } from 'lucide-react';

interface MarketMoversTableProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
  recentFlashSymbols: Record<string, 'up' | 'down'>;
}

type FilterTab = 'most-active' | 'gainers' | 'losers' | 'tech' | 'all';
type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap';

export const MarketMoversTable: React.FC<MarketMoversTableProps> = ({
  assets,
  onSelectAsset,
  selectedSymbol,
  watchlistSymbols,
  onToggleWatchlist,
  recentFlashSymbols,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('most-active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter items based on active tab and search query
  const filteredAssets = useMemo(() => {
    let list = [...assets];

    // Filter by tab
    if (activeTab === 'gainers') {
      list = list.filter((a) => a.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === 'losers') {
      list = list.filter((a) => a.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
    } else if (activeTab === 'tech') {
      list = list.filter((a) => a.sector === 'Information Technology' || ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN'].includes(a.symbol));
    } else if (activeTab === 'most-active') {
      // Sort by prominence
      list = list.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Apply column sort if user clicked column header
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'symbol') {
        comparison = a.symbol.localeCompare(b.symbol);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'changePercent') {
        comparison = a.changePercent - b.changePercent;
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [assets, activeTab, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] overflow-hidden theme-light:bg-white theme-light:border-[#e0e3eb]">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#2a2e39] flex flex-col md:flex-row md:items-center justify-between gap-3 theme-light:border-[#e0e3eb]">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722]">
            Market Movers & Screeners
          </h3>
          <p className="text-xs text-[#787b86]">
            Real-time quotes, technical momentum, and volume leaders
          </p>
        </div>

        {/* Tab Filters and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
            {(
              [
                { id: 'most-active', label: 'Most Active' },
                { id: 'gainers', label: 'Top Gainers' },
                { id: 'losers', label: 'Top Losers' },
                { id: 'tech', label: 'Mega Tech' },
                { id: 'all', label: 'All Markets' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                    : 'text-[#787b86] hover:text-[#d1d4dc] theme-light:hover:text-[#131722]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#787b86]" />
            <input
              type="text"
              placeholder="Filter table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#131722] border border-[#2a2e39] text-[#d1d4dc] placeholder-[#787b86] focus:outline-none focus:border-[#2962ff] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#131722]"
            />
          </div>
        </div>
      </div>

      {/* High Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] bg-[#161922] text-[#787b86] font-medium theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
              <th className="py-2.5 px-4 w-10 text-center">Watch</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right hidden sm:table-cell">Change ($)</th>
              <th className="py-2.5 px-4 text-right hidden md:table-cell">24h High</th>
              <th className="py-2.5 px-4 text-right hidden md:table-cell">24h Low</th>
              <th className="py-2.5 px-4 text-right hidden lg:table-cell">Volume</th>
              <th className="py-2.5 px-4 text-right hidden xl:table-cell">Market Cap</th>
              <th className="py-2.5 px-4 text-center hidden md:table-cell w-28">7D Trend</th>
              <th className="py-2.5 px-4 text-center w-16">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39] text-[#d1d4dc] theme-light:divide-[#e0e3eb] theme-light:text-[#131722]">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-[#787b86]">
                  No financial instruments found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isPositive = asset.change >= 0;
                const isSelected = selectedSymbol === asset.symbol;
                const isWatched = watchlistSymbols.includes(asset.symbol);
                const flash = recentFlashSymbols[asset.symbol];

                // Mini sparkline
                const sMin = Math.min(...asset.sparkline);
                const sMax = Math.max(...asset.sparkline);
                const sDelta = sMax - sMin || 1;
                const sparkPoints = asset.sparkline
                  .map((val, idx) => {
                    const x = (idx / (asset.sparkline.length - 1)) * 70;
                    const y = 20 - ((val - sMin) / sDelta) * 16;
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => onSelectAsset(asset)}
                    className={`hover:bg-[#2a2e39]/60 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-[#2962ff]/10 font-semibold' : ''
                    } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
                  >
                    {/* Watchlist star */}
                    <td
                      className="py-2.5 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(asset.symbol);
                      }}
                    >
                      <button className="text-[#787b86] hover:text-[#f59e0b] focus:outline-none">
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isWatched ? 'fill-[#f59e0b] text-[#f59e0b]' : ''
                          }`}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white theme-light:text-[#131722]">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] px-1 py-0.2 rounded bg-[#131722] border border-[#2a2e39] font-mono theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
                          {asset.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#787b86] truncate max-w-[180px] block">
                        {asset.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono font-bold text-white theme-light:text-[#131722]">
                      ${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.price < 10 ? 3 : 2,
                        maximumFractionDigits: asset.price < 10 ? 3 : 2,
                      })}
                    </td>

                    {/* Change % */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {isPositive ? '+' : ''}
                          {asset.changePercent.toFixed(2)}%
                        </span>
                      </span>
                    </td>

                    {/* Change $ */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono hidden sm:table-cell">
                      <span className={isPositive ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {isPositive ? '+' : ''}
                        {asset.change.toFixed(2)}
                      </span>
                    </td>

                    {/* 24h High */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86] hidden md:table-cell">
                      {asset.high24h.toLocaleString()}
                    </td>

                    {/* 24h Low */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86] hidden md:table-cell">
                      {asset.low24h.toLocaleString()}
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#d1d4dc] theme-light:text-[#131722] hidden lg:table-cell">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86] hidden xl:table-cell">
                      {asset.marketCap}
                    </td>

                    {/* 7D Sparkline */}
                    <td className="py-2.5 px-4 text-center hidden md:table-cell">
                      <div className="w-20 h-6 mx-auto">
                        <svg viewBox="0 0 70 20" className="w-full h-full overflow-visible">
                          <polyline
                            fill="none"
                            stroke={isPositive ? '#089981' : '#f23645'}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            points={sparkPoints}
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Open Chart */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="p-1 rounded text-[#787b86] hover:text-[#2962ff] hover:bg-[#2a2e39] transition-colors"
                        title="Open technical chart"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
