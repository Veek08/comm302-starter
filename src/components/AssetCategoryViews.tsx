import React, { useState } from 'react';
import { MarketAsset, MarketCategory } from '../types/market';
import { CRYPTO_METRICS, FOREX_MATRIX } from '../data/mockMarketData';
import { TrendingUp, TrendingDown, DollarSign, Activity, Compass, ShieldAlert } from 'lucide-react';

interface AssetCategoryViewsProps {
  category: MarketCategory;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  selectedSymbol: string;
}

export const AssetCategoryViews: React.FC<AssetCategoryViewsProps> = ({
  category,
  assets,
  onSelectAsset,
  selectedSymbol,
}) => {
  const categoryAssets = assets.filter((a) => a.category === category);

  // Render specific specialized view based on category
  if (category === 'crypto') {
    return (
      <div className="space-y-4">
        {/* Crypto Global Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">Total Market Cap</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="tabular-nums font-mono text-base font-bold text-white theme-light:text-[#131722]">{CRYPTO_METRICS.totalMarketCap}</span>
              <span className="text-[11px] font-mono text-[#089981]">+{CRYPTO_METRICS.totalMarketCapChange}%</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">24h Global Volume</span>
            <span className="tabular-nums font-mono text-base font-bold text-white theme-light:text-[#131722] mt-1 block">{CRYPTO_METRICS.volume24h}</span>
          </div>
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">Bitcoin Dominance</span>
            <span className="tabular-nums font-mono text-base font-bold text-[#f59e0b] mt-1 block">{CRYPTO_METRICS.btcDominance}%</span>
          </div>
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">Ethereum Dominance</span>
            <span className="tabular-nums font-mono text-base font-bold text-[#2962ff] mt-1 block">{CRYPTO_METRICS.ethDominance}%</span>
          </div>
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">Fear & Greed Index</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="tabular-nums font-mono text-base font-bold text-[#089981]">{CRYPTO_METRICS.fearGreedIndex}</span>
              <span className="text-[11px] text-[#089981] font-semibold">{CRYPTO_METRICS.fearGreedStatus}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-[#2a2e39] bg-[#1e222d] theme-light:bg-white theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86] block">ETH Gas Price</span>
            <span className="tabular-nums font-mono text-base font-bold text-white theme-light:text-[#131722] mt-1 block">{CRYPTO_METRICS.gasPriceGwei} Gwei</span>
          </div>
        </div>

        {/* Crypto Coins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categoryAssets.map((asset) => {
            const isPos = asset.changePercent >= 0;
            return (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className={`p-4 rounded-xl border bg-[#1e222d] hover:border-[#2962ff] cursor-pointer transition-all theme-light:bg-white theme-light:border-[#e0e3eb] ${
                  selectedSymbol === asset.symbol ? 'border-[#2962ff] ring-1 ring-[#2962ff]' : 'border-[#2a2e39]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-bold text-xs flex items-center justify-center">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#d1d4dc] theme-light:text-[#131722]">{asset.symbol}</h4>
                      <p className="text-[11px] text-[#787b86]">{asset.name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#787b86] px-1.5 py-0.5 rounded bg-[#131722] theme-light:bg-[#f0f3fa]">
                    Rank #1
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="tabular-nums font-mono text-lg font-bold text-white theme-light:text-[#131722]">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 tabular-nums font-mono text-xs font-bold ${
                      isPos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2a2e39] grid grid-cols-2 gap-2 text-[11px] text-[#787b86] theme-light:border-[#e0e3eb]">
                  <div>24h Vol: <strong className="text-[#d1d4dc] theme-light:text-[#131722] font-mono">{asset.volume}</strong></div>
                  <div>Market Cap: <strong className="text-[#d1d4dc] theme-light:text-[#131722] font-mono">{asset.marketCap}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (category === 'forex') {
    return (
      <div className="space-y-4">
        {/* Currency Strength Meter */}
        <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] p-4 space-y-3 theme-light:bg-white theme-light:border-[#e0e3eb]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#d1d4dc] theme-light:text-[#131722]">Currency Relative Strength Meter</h3>
              <p className="text-xs text-[#787b86]">Live daily strength index across G10 currencies</p>
            </div>
            <span className="text-[11px] font-mono text-[#089981]">AUD Strongest · JPY Weakest</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { code: 'AUD', val: 78, change: '+0.62%', pos: true },
              { code: 'GBP', val: 68, change: '+0.32%', pos: true },
              { code: 'EUR', val: 58, change: '+0.25%', pos: true },
              { code: 'USD', val: 50, change: '0.00%', pos: true },
              { code: 'CAD', val: 44, change: '-0.22%', pos: false },
              { code: 'CHF', val: 38, change: '-0.18%', pos: false },
              { code: 'JPY', val: 24, change: '-0.45%', pos: false },
            ].map((cur) => (
              <div key={cur.code} className="p-2.5 rounded-lg bg-[#131722] border border-[#2a2e39] text-center theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
                <span className="font-bold text-sm text-white theme-light:text-[#131722]">{cur.code}</span>
                <span className={`block text-[11px] font-mono mt-0.5 ${cur.pos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {cur.change}
                </span>
                <div className="mt-2 h-1.5 w-full bg-[#1e222d] rounded-full overflow-hidden theme-light:bg-[#e0e3eb]">
                  <div
                    className={`h-full rounded-full ${cur.pos ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                    style={{ width: `${cur.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forex Cross Rates Matrix Table */}
        <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] overflow-hidden theme-light:bg-white theme-light:border-[#e0e3eb]">
          <div className="p-4 border-b border-[#2a2e39] theme-light:border-[#e0e3eb]">
            <h4 className="font-bold text-sm text-[#d1d4dc] theme-light:text-[#131722]">G10 Major Pairs Live Rates</h4>
            <p className="text-xs text-[#787b86]">Interbank bid/ask quotes and daily range</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#161922] text-[#787b86] border-b border-[#2a2e39] theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
                  <th className="py-2.5 px-4">Currency Pair</th>
                  <th className="py-2.5 px-4 text-right">Bid</th>
                  <th className="py-2.5 px-4 text-right">Ask</th>
                  <th className="py-2.5 px-4 text-right">Spread (pips)</th>
                  <th className="py-2.5 px-4 text-right">Daily Change %</th>
                  <th className="py-2.5 px-4 text-right">Day High</th>
                  <th className="py-2.5 px-4 text-right">Day Low</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39] text-[#d1d4dc] theme-light:divide-[#e0e3eb] theme-light:text-[#131722]">
                {FOREX_MATRIX.map((fx) => {
                  const isPos = fx.change >= 0;
                  return (
                    <tr
                      key={fx.pair}
                      onClick={() => {
                        const target = assets.find((a) => a.symbol === fx.pair.replace('/', ''));
                        if (target) onSelectAsset(target);
                      }}
                      className="hover:bg-[#2a2e39]/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-white theme-light:text-[#131722]">{fx.pair}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono">{fx.bid.toFixed(4)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono">{fx.ask.toFixed(4)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86]">
                        {((fx.ask - fx.bid) * 10000).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono font-bold">
                        <span className={isPos ? 'text-[#089981]' : 'text-[#f23645]'}>
                          {isPos ? '+' : ''}{fx.change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86]">{fx.high.toFixed(4)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[#787b86]">{fx.low.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (category === 'bonds') {
    return (
      <div className="space-y-4">
        {/* US Treasury Yield Curve Visualizer */}
        <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] p-4 space-y-4 theme-light:bg-white theme-light:border-[#e0e3eb]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#d1d4dc] theme-light:text-[#131722]">US Sovereign Yield Curve</h3>
              <p className="text-xs text-[#787b86]">Term structure of interest rates across tenors</p>
            </div>
            <div className="text-xs text-[#787b86] font-mono">
              10Y-2Y Spread: <strong className="text-[#089981] font-bold">+19.2 bps</strong> (Disinverted)
            </div>
          </div>

          {/* SVG Yield Curve Graph */}
          <div className="h-48 w-full bg-[#131722] rounded-lg p-3 relative theme-light:bg-[#f8f9fd]">
            <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
              {/* Guides */}
              <line x1="0" y1="35" x2="500" y2="35" stroke="#2a2e39" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#2a2e39" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="500" y2="105" stroke="#2a2e39" strokeDasharray="3 3" />

              {/* Curve points: 1M (4.8%), 3M (4.6%), 6M (4.3%), 1Y (3.9%), 2Y (3.56%), 5Y (3.52%), 10Y (3.75%), 30Y (4.12%) */}
              <polyline
                fill="none"
                stroke="#2962ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="30,25 90,32 150,45 210,65 270,85 330,88 400,75 470,55"
              />

              {/* Data points */}
              {[
                { x: 30, y: 25, label: '1M', rate: '4.80%' },
                { x: 90, y: 32, label: '3M', rate: '4.62%' },
                { x: 150, y: 45, label: '6M', rate: '4.31%' },
                { x: 210, y: 65, label: '1Y', rate: '3.92%' },
                { x: 270, y: 85, label: '2Y', rate: '3.56%' },
                { x: 330, y: 88, label: '5Y', rate: '3.52%' },
                { x: 400, y: 75, label: '10Y', rate: '3.75%' },
                { x: 470, y: 55, label: '30Y', rate: '4.12%' },
              ].map((pt) => (
                <g key={pt.label}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#2962ff" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={pt.x} y={pt.y - 10} fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                    {pt.rate}
                  </text>
                  <text x={pt.x} y="130" fill="#787b86" fontSize="10" textAnchor="middle">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Bond instruments list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryAssets.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`p-4 rounded-xl border bg-[#1e222d] hover:border-[#2962ff] cursor-pointer transition-all theme-light:bg-white theme-light:border-[#e0e3eb] ${
                selectedSymbol === asset.symbol ? 'border-[#2962ff] ring-1 ring-[#2962ff]' : 'border-[#2a2e39]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#d1d4dc] theme-light:text-[#131722]">{asset.symbol}</span>
                <span className="text-[10px] text-[#787b86] font-mono">{asset.exchange}</span>
              </div>
              <p className="text-xs text-[#787b86] mt-0.5">{asset.name}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="tabular-nums font-mono text-lg font-bold text-white theme-light:text-[#131722]">
                  {asset.price.toFixed(3)}%
                </span>
                <span
                  className={`tabular-nums font-mono text-xs font-bold ${
                    asset.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Futures & Commodities View
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categoryAssets.map((asset) => {
          const isPos = asset.changePercent >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`p-4 rounded-xl border bg-[#1e222d] hover:border-[#2962ff] cursor-pointer transition-all theme-light:bg-white theme-light:border-[#e0e3eb] ${
                selectedSymbol === asset.symbol ? 'border-[#2962ff] ring-1 ring-[#2962ff]' : 'border-[#2a2e39]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#d1d4dc] theme-light:text-[#131722]">{asset.symbol}</h4>
                  <p className="text-[11px] text-[#787b86]">{asset.name}</p>
                </div>
                <span className="text-[10px] text-[#787b86] font-mono px-1.5 py-0.5 rounded bg-[#131722] theme-light:bg-[#f0f3fa]">
                  {asset.exchange}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="tabular-nums font-mono text-lg font-bold text-white theme-light:text-[#131722]">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`flex items-center gap-0.5 tabular-nums font-mono text-xs font-bold ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-[#2a2e39] flex items-center justify-between text-[11px] text-[#787b86] theme-light:border-[#e0e3eb]">
                <span>24h High: <strong className="text-[#089981] font-mono">${asset.high24h.toLocaleString()}</strong></span>
                <span>24h Low: <strong className="text-[#f23645] font-mono">${asset.low24h.toLocaleString()}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
