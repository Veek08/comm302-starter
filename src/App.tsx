/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_ASSETS } from './data/mockMarketData';
import { MarketAsset, MarketCategory, PortfolioPosition } from './types/market';
import { Navbar } from './components/Navbar';
import { TickerTape } from './components/TickerTape';
import { MarketSummaryCards } from './components/MarketSummaryCards';
import { TradingViewChart } from './components/TradingViewChart';
import { MarketHeatmap } from './components/MarketHeatmap';
import { MarketMoversTable } from './components/MarketMoversTable';
import { AssetCategoryViews } from './components/AssetCategoryViews';
import { EconomicCalendar } from './components/EconomicCalendar';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { QuickSearchModal } from './components/QuickSearchModal';
import { EditorialNews } from './components/EditorialNews';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SPX');
  const [currentCategory, setCurrentCategory] = useState<MarketCategory | 'overview' | 'heatmap' | 'calendar'>('overview');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLiveTicking, setIsLiveTicking] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Watchlist items (symbols)
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_watchlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return ['SPX', 'NDX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'CL1!'];
  });

  // Paper portfolio positions
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem('tv_positions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        quantity: 25,
        avgEntryPrice: 132.50,
        currentPrice: 138.25,
        side: 'BUY',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        quantity: 0.5,
        avgEntryPrice: 63100,
        currentPrice: 65420,
        side: 'BUY',
        timestamp: Date.now() - 86400000 * 4,
      },
    ];
  });

  // Flash indicator tracker for recently ticked symbols
  const [recentFlashSymbols, setRecentFlashSymbols] = useState<Record<string, 'up' | 'down'>>({});

  // Persist watchlist and positions
  useEffect(() => {
    localStorage.setItem('tv_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  useEffect(() => {
    localStorage.setItem('tv_positions', JSON.stringify(positions));
  }, [positions]);

  // Handle Theme class toggling
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
      document.body.style.backgroundColor = '#131722';
      document.body.style.color = '#d1d4dc';
    } else {
      root.classList.add('theme-light');
      document.body.classList.add('theme-light');
      document.body.style.backgroundColor = '#f8f9fd';
      document.body.style.color = '#131722';
    }
  }, [isDarkTheme]);

  // Real-time market tick engine
  useEffect(() => {
    if (!isLiveTicking) return;

    const interval = setInterval(() => {
      // Pick 1-2 random assets to tick
      setAssets((prev) => {
        const next = [...prev];
        const randomIdx = Math.floor(Math.random() * next.length);
        const target = { ...next[randomIdx] };

        // Micro tick: between -0.3% and +0.3%
        const deltaPct = (Math.random() - 0.49) * 0.003;
        const priceChange = target.price * deltaPct;
        const newPrice = Math.max(0.01, target.price + priceChange);
        const direction = priceChange >= 0 ? 'up' : 'down';

        target.price = Number(newPrice.toFixed(target.price < 10 ? 4 : 2));
        target.change = Number((target.change + priceChange).toFixed(target.price < 10 ? 4 : 2));
        target.changePercent = Number((((target.price - (target.price - target.change)) / (target.price - target.change)) * 100).toFixed(2));
        if (target.price > target.high24h) target.high24h = target.price;
        if (target.price < target.low24h) target.low24h = target.price;

        next[randomIdx] = target;

        // Record flash
        setRecentFlashSymbols((f) => ({ ...f, [target.symbol]: direction }));
        setTimeout(() => {
          setRecentFlashSymbols((f) => {
            const copy = { ...f };
            delete copy[target.symbol];
            return copy;
          });
        }, 800);

        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isLiveTicking]);

  // Currently selected asset
  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  const handleSelectAsset = (asset: MarketAsset) => {
    setSelectedSymbol(asset.symbol);
    // Smooth scroll up to chart workstation if not already visible
    window.scrollTo({ top: 110, behavior: 'smooth' });
  };

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleTradeExecuted = (symbol: string, side: 'BUY' | 'SELL', amount: number, price: number) => {
    const asset = assets.find((a) => a.symbol === symbol);
    const newPos: PortfolioPosition = {
      symbol,
      name: asset?.name || symbol,
      quantity: amount,
      avgEntryPrice: price,
      currentPrice: price,
      side,
      timestamp: Date.now(),
    };
    setPositions((prev) => [newPos, ...prev]);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-[#131722] text-[#d1d4dc]' : 'bg-[#f8f9fd] text-[#131722]'}`}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={(cat) => setCurrentCategory(cat)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlistSymbols.length}
        isWatchlistOpen={isWatchlistOpen}
        isLiveTicking={isLiveTicking}
        onToggleLiveTicking={() => setIsLiveTicking(!isLiveTicking)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
        onLaunchFullChart={() => {
          window.scrollTo({ top: 90, behavior: 'smooth' });
        }}
      />

      {/* 2. Streaming Ticker Tape Banner */}
      <TickerTape
        assets={assets}
        onSelectAsset={handleSelectAsset}
        recentFlashSymbols={recentFlashSymbols}
      />

      {/* 3. Main Dashboard Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Render View Based on Active Tab */}
        {currentCategory === 'overview' && (
          <>
            {/* Top Market Summary Cards */}
            <section aria-label="Market Summary Cards">
              <MarketSummaryCards
                assets={assets}
                selectedSymbol={selectedSymbol}
                onSelectAsset={handleSelectAsset}
                recentFlashSymbols={recentFlashSymbols}
              />
            </section>

            {/* TradingView Superchart Workstation */}
            <section aria-label="Interactive Chart Workstation" id="chart-section">
              <TradingViewChart
                asset={selectedAsset}
                onTradeExecuted={handleTradeExecuted}
                isInWatchlist={watchlistSymbols.includes(selectedAsset.symbol)}
                onToggleWatchlist={handleToggleWatchlist}
              />
            </section>

            {/* S&P 500 Market Heatmap and Breadth */}
            <section aria-label="Market Heatmap">
              <MarketHeatmap onSelectSymbol={(sym) => setSelectedSymbol(sym)} />
            </section>

            {/* Market Movers & Screener Table */}
            <section aria-label="Market Movers Table">
              <MarketMoversTable
                assets={assets}
                onSelectAsset={handleSelectAsset}
                selectedSymbol={selectedSymbol}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={handleToggleWatchlist}
                recentFlashSymbols={recentFlashSymbols}
              />
            </section>

            {/* Economic Insights & Institutional Editorial News */}
            <section aria-label="Editorial News & Analysis">
              <EditorialNews />
            </section>
          </>
        )}

        {currentCategory === 'heatmap' && (
          <div className="space-y-6">
            <MarketHeatmap onSelectSymbol={(sym) => setSelectedSymbol(sym)} />
            <TradingViewChart
              asset={selectedAsset}
              onTradeExecuted={handleTradeExecuted}
              isInWatchlist={watchlistSymbols.includes(selectedAsset.symbol)}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {currentCategory === 'calendar' && (
          <div className="space-y-6">
            <EconomicCalendar />
            <EditorialNews />
          </div>
        )}

        {(currentCategory === 'indices' ||
          currentCategory === 'stocks' ||
          currentCategory === 'crypto' ||
          currentCategory === 'forex' ||
          currentCategory === 'futures' ||
          currentCategory === 'bonds') && (
          <div className="space-y-6">
            {/* Active Technical Chart for the selected category asset */}
            <TradingViewChart
              asset={selectedAsset}
              onTradeExecuted={handleTradeExecuted}
              isInWatchlist={watchlistSymbols.includes(selectedAsset.symbol)}
              onToggleWatchlist={handleToggleWatchlist}
            />

            {/* Dedicated category specialized breakdown view */}
            <AssetCategoryViews
              category={currentCategory}
              assets={assets}
              onSelectAsset={handleSelectAsset}
              selectedSymbol={selectedSymbol}
            />

            {/* Movers table scoped to category */}
            <MarketMoversTable
              assets={assets.filter((a) => a.category === currentCategory)}
              onSelectAsset={handleSelectAsset}
              selectedSymbol={selectedSymbol}
              watchlistSymbols={watchlistSymbols}
              onToggleWatchlist={handleToggleWatchlist}
              recentFlashSymbols={recentFlashSymbols}
            />
          </div>
        )}
      </main>

      {/* 4. Dockable Watchlist & Portfolio Sidebar */}
      <WatchlistSidebar
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlistSymbols}
        allAssets={assets}
        onSelectAsset={(asset) => {
          handleSelectAsset(asset);
          if (window.innerWidth < 640) setIsWatchlistOpen(false);
        }}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onAddToWatchlist={(sym) => {
          if (!watchlistSymbols.includes(sym)) {
            setWatchlistSymbols([...watchlistSymbols, sym]);
          }
        }}
        selectedSymbol={selectedSymbol}
        recentFlashSymbols={recentFlashSymbols}
        positions={positions}
      />

      {/* 5. Quick Search Modal (⌘K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        onSelectAsset={handleSelectAsset}
      />

      {/* 6. Professional Financial Footer */}
      <footer className="border-t border-[#2a2e39] bg-[#1e222d] py-8 text-xs text-[#787b86] theme-light:bg-white theme-light:border-[#e0e3eb]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center text-white font-bold text-xs">
              TV
            </div>
            <span className="font-bold text-[#d1d4dc] theme-light:text-[#131722]">
              TradingView Markets Platform
            </span>
            <span aria-hidden="true">·</span>
            <span>Real-time Financial Telemetry & Charting Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Quotes streamed in real-time</span>
            <span aria-hidden="true">·</span>
            <span>Nasdaq, NYSE, CME, COMEX, ICE</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Service</span>
            <span aria-hidden="true">·</span>
            <span>Risk Disclosure Notice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
