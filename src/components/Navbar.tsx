import React from 'react';
import { Search, Bookmark, Zap, Sun, Moon, BarChart2 } from 'lucide-react';
import { MarketCategory } from '../types/market';

interface NavbarProps {
  currentCategory: MarketCategory | 'overview' | 'heatmap' | 'calendar';
  onSelectCategory: (cat: MarketCategory | 'overview' | 'heatmap' | 'calendar') => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  isWatchlistOpen: boolean;
  isLiveTicking: boolean;
  onToggleLiveTicking: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onLaunchFullChart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  isWatchlistOpen,
  isLiveTicking,
  onToggleLiveTicking,
  isDarkTheme,
  onToggleTheme,
  onLaunchFullChart,
}) => {
  const navTabs: Array<{ id: MarketCategory | 'overview' | 'heatmap' | 'calendar'; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'indices', label: 'Indices' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#2a2e39] bg-[#131722]/95 backdrop-blur-md transition-colors theme-light:bg-white/95 theme-light:border-[#e0e3eb]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectCategory('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            {/* TradingView signature geometric icon */}
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-bold shadow-md shadow-[#2962ff]/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M4 14h3v5H4v-5zm6-8h3v13h-3V6zm6 4h3v9h-3v-9z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722] group-hover:text-white transition-colors">
              TradingView <span className="font-normal text-xs text-[#787b86] ml-0.5">Markets</span>
            </span>
          </button>

          {/* Quick Search Bar trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-[#787b86] text-xs transition-colors theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#787b86]"
          >
            <Search className="w-3.5 h-3.5 text-[#787b86]" />
            <span className="truncate max-w-[160px]">Search ticker, market...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] border border-[#2a2e39] rounded text-[#787b86] theme-light:bg-white theme-light:border-[#d1d4dc]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = currentCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white bg-[#2a2e39] font-semibold theme-light:bg-[#e0e3eb] theme-light:text-[#131722]'
                    : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] theme-light:hover:text-[#131722] theme-light:hover:bg-[#f0f3fa]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] rounded-lg transition-colors theme-light:hover:bg-[#f0f3fa]"
            title="Search Markets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Live Tick Stream Pulse Toggle */}
          <button
            onClick={onToggleLiveTicking}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              isLiveTicking
                ? 'border-[#089981]/40 bg-[#089981]/10 text-[#089981]'
                : 'border-[#2a2e39] bg-[#1e222d] text-[#787b86] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]'
            }`}
            title={isLiveTicking ? 'Live streaming active (click to pause)' : 'Live stream paused (click to resume)'}
          >
            <Zap className={`w-3.5 h-3.5 ${isLiveTicking ? 'animate-pulse text-[#089981]' : ''}`} />
            <span className="hidden sm:inline font-mono text-[11px]">
              {isLiveTicking ? 'LIVE' : 'PAUSED'}
            </span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] border border-[#2a2e39] rounded-lg transition-colors theme-light:border-[#e0e3eb] theme-light:hover:bg-[#f0f3fa]"
            title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Watchlist Drawer Toggle */}
          <button
            onClick={onToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isWatchlistOpen
                ? 'bg-[#2962ff] text-white border-[#2962ff]'
                : 'bg-[#1e222d] text-[#d1d4dc] border-[#2a2e39] hover:bg-[#2a2e39] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#131722]'
            }`}
            title="Toggle Watchlist"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30 text-white">
              {watchlistCount}
            </span>
          </button>

          {/* Launch Full Technical Chart Button */}
          <button
            onClick={onLaunchFullChart}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2962ff] hover:bg-[#1e53e5] text-white transition-all shadow-sm shadow-[#2962ff]/30 active:scale-95"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Superchart</span>
          </button>
        </div>
      </div>

      {/* Sub-nav row for mobile/tablet screens */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-[#2a2e39] no-scrollbar theme-light:border-[#e0e3eb]">
        {navTabs.map((tab) => {
          const isActive = currentCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-white bg-[#2a2e39] font-semibold theme-light:bg-[#e0e3eb] theme-light:text-[#131722]'
                  : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#1e222d] theme-light:hover:text-[#131722]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
