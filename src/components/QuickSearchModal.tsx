import React, { useState, useEffect } from 'react';
import { MarketAsset } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = assets.filter((asset) => {
    if (filterCategory !== 'all' && asset.category !== filterCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.exchange.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-xl bg-[#1e222d] border border-[#2a2e39] shadow-2xl overflow-hidden text-[#d1d4dc] theme-light:bg-white theme-light:border-[#e0e3eb] theme-light:text-[#131722]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#2a2e39] flex items-center gap-3 theme-light:border-[#e0e3eb]">
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            type="text"
            placeholder="Search by symbol, company, crypto, or pair (e.g., NVDA, BTC, EUR/USD)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-[#787b86] focus:outline-none theme-light:text-[#131722]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 bg-[#161922] border-b border-[#2a2e39] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
          {['all', 'indices', 'stocks', 'crypto', 'forex', 'futures', 'bonds'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-[#2962ff] text-white font-semibold'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39] theme-light:divide-[#e0e3eb]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#787b86]">
              No financial symbols match "{query}". Try searching for Apple, Bitcoin, or S&P 500.
            </div>
          ) : (
            filtered.map((asset) => {
              const isPos = asset.changePercent >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-[#2a2e39]/60 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#131722] border border-[#2a2e39] flex items-center justify-center font-bold text-xs text-[#2962ff] font-mono">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white theme-light:text-[#131722]">{asset.symbol}</span>
                        <span className="text-[10px] text-[#787b86] font-mono px-1 py-0.2 rounded bg-[#131722] border border-[#2a2e39]">
                          {asset.exchange} · {asset.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#787b86]">{asset.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="tabular-nums font-mono text-sm font-bold text-white theme-light:text-[#131722] block">
                        ${asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: asset.price < 10 ? 3 : 2,
                        })}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#787b86] group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#161922] border-t border-[#2a2e39] flex items-center justify-between text-[11px] text-[#787b86] font-mono theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
