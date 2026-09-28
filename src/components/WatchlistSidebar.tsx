import React, { useState } from 'react';
import { MarketAsset, PortfolioPosition } from '../types/market';
import { X, Plus, TrendingUp, TrendingDown, Trash2, Briefcase, Bookmark } from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  allAssets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  selectedSymbol: string;
  recentFlashSymbols: Record<string, 'up' | 'down'>;
  positions: PortfolioPosition[];
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  allAssets,
  onSelectAsset,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  selectedSymbol,
  recentFlashSymbols,
  positions,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio'>('watchlist');
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const watchedAssets = watchlistSymbols
    .map((s) => allAssets.find((a) => a.symbol === s))
    .filter((a): a is MarketAsset => Boolean(a));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolInput.trim()) return;
    const sym = newSymbolInput.trim().toUpperCase();
    const exists = allAssets.find((a) => a.symbol === sym);
    if (exists) {
      onAddToWatchlist(sym);
      setNewSymbolInput('');
      setIsAdding(false);
    }
  };

  // Calculate portfolio balance
  const initialCash = 100000;
  const portfolioPnL = positions.reduce((acc, pos) => {
    const currentAsset = allAssets.find((a) => a.symbol === pos.symbol);
    const curPrice = currentAsset ? currentAsset.price : pos.currentPrice;
    const diff = pos.side === 'BUY' ? curPrice - pos.avgEntryPrice : pos.avgEntryPrice - curPrice;
    return acc + diff * pos.quantity;
  }, 0);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-[#1e222d] border-l border-[#2a2e39] shadow-2xl flex flex-col theme-light:bg-white theme-light:border-[#e0e3eb]">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#2a2e39] flex items-center justify-between theme-light:border-[#e0e3eb]">
        <div className="flex items-center gap-1 p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchedAssets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'portfolio'
                ? 'bg-[#2a2e39] text-white shadow-sm font-semibold theme-light:bg-white theme-light:text-[#131722]'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Paper Portfolio ({positions.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#787b86] hover:text-white hover:bg-[#2a2e39] rounded-lg transition-colors"
          title="Close Watchlist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Watchlist Tab Body */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Quick Add Form */}
          <div className="p-3 border-b border-[#2a2e39] theme-light:border-[#e0e3eb]">
            {isAdding ? (
              <form onSubmit={handleAddSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ticker (e.g. NVDA)..."
                  value={newSymbolInput}
                  onChange={(e) => setNewSymbolInput(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#131722] border border-[#2a2e39] text-white focus:outline-none focus:border-[#2962ff] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#131722]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#2962ff] text-white text-xs font-semibold"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1.5 text-[#787b86] hover:text-white text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-1.5 px-3 rounded-lg border border-dashed border-[#2a2e39] hover:border-[#2962ff] text-[#787b86] hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Symbol to Watchlist</span>
              </button>
            )}
          </div>

          {/* List of Watched Assets */}
          <div className="flex-1 divide-y divide-[#2a2e39] overflow-y-auto theme-light:divide-[#e0e3eb]">
            {watchedAssets.map((asset) => {
              const isPos = asset.changePercent >= 0;
              const isSelected = selectedSymbol === asset.symbol;
              const flash = recentFlashSymbols[asset.symbol];

              return (
                <div
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className={`p-3 hover:bg-[#2a2e39]/60 cursor-pointer transition-colors group flex items-center justify-between ${
                    isSelected ? 'bg-[#2962ff]/10 border-l-2 border-[#2962ff]' : ''
                  } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white theme-light:text-[#131722]">{asset.symbol}</span>
                      <span className="text-[10px] text-[#787b86] font-mono">{asset.exchange}</span>
                    </div>
                    <span className="text-[11px] text-[#787b86] truncate max-w-[130px] block">{asset.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="tabular-nums font-mono text-xs font-bold text-white theme-light:text-[#131722]">
                        ${asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: asset.price < 10 ? 3 : 2,
                          maximumFractionDigits: asset.price < 10 ? 3 : 2,
                        })}
                      </div>
                      <div
                        className={`flex items-center justify-end gap-0.5 tabular-nums font-mono text-[11px] font-semibold ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        <span>{isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(asset.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] transition-opacity"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio Tab Body */}
      {activeTab === 'portfolio' && (
        <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-4">
          {/* Account Summary Banner */}
          <div className="p-3.5 rounded-xl bg-[#131722] border border-[#2a2e39] text-xs space-y-2 theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
            <div className="text-[#787b86]">Total Account Equity (Simulated)</div>
            <div className="tabular-nums font-mono text-xl font-bold text-white theme-light:text-[#131722]">
              ${(initialCash + portfolioPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="flex justify-between items-center text-[11px] pt-2 border-t border-[#2a2e39] theme-light:border-[#e0e3eb]">
              <span className="text-[#787b86]">Unrealized P&L:</span>
              <span
                className={`tabular-nums font-mono font-bold ${
                  portfolioPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)} (
                {((portfolioPnL / initialCash) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Positions List */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            <h4 className="text-xs font-semibold text-[#787b86]">Open Positions</h4>
            {positions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#787b86]">
                No active positions. Click "Paper Trade" on any chart to execute simulated orders!
              </div>
            ) : (
              positions.map((pos, idx) => {
                const currentAsset = allAssets.find((a) => a.symbol === pos.symbol);
                const curPrice = currentAsset ? currentAsset.price : pos.currentPrice;
                const pnl = pos.side === 'BUY' ? (curPrice - pos.avgEntryPrice) * pos.quantity : (pos.avgEntryPrice - curPrice) * pos.quantity;
                const isPos = pnl >= 0;

                return (
                  <div
                    key={`${pos.symbol}-${idx}`}
                    className="p-3 rounded-lg border border-[#2a2e39] bg-[#131722] space-y-1.5 text-xs theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white theme-light:text-[#131722]">{pos.symbol}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            pos.side === 'BUY' ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
                          }`}
                        >
                          {pos.side}
                        </span>
                      </div>
                      <span className="tabular-nums font-mono text-[#787b86]">
                        {pos.quantity} units
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-[#787b86]">
                      <span>Entry: ${pos.avgEntryPrice.toLocaleString()}</span>
                      <span>Mark: ${curPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#2a2e39] text-[11px] theme-light:border-[#e0e3eb]">
                      <span>P&L:</span>
                      <span className={`tabular-nums font-mono font-bold ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPos ? '+' : ''}${pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
