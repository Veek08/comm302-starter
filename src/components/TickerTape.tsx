import React from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  recentFlashSymbols: Record<string, 'up' | 'down'>;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  assets,
  onSelectAsset,
  recentFlashSymbols,
}) => {
  // Take major key assets for the tape (indices, crypto, top stocks, commodities)
  const tapeSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'NVDA', 'AAPL', 'TSLA', 'XAUUSD', 'CL1!', 'EURUSD', 'US10Y'];
  const tapeAssets = tapeSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter((a): a is MarketAsset => Boolean(a));

  return (
    <div className="w-full bg-[#1e222d] border-b border-[#2a2e39] overflow-hidden theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
      <div className="flex items-center divide-x divide-[#2a2e39] overflow-x-auto no-scrollbar py-1.5 theme-light:divide-[#e0e3eb]">
        {tapeAssets.map((asset) => {
          const isPositive = asset.change >= 0;
          const flashState = recentFlashSymbols[asset.symbol];

          return (
            <button
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`flex items-center gap-2 px-3 py-0.5 whitespace-nowrap text-xs transition-colors hover:bg-[#2a2e39] theme-light:hover:bg-[#e0e3eb] shrink-0 text-left ${
                flashState === 'up'
                  ? 'flash-up'
                  : flashState === 'down'
                  ? 'flash-down'
                  : ''
              }`}
            >
              <span className="font-semibold text-[#d1d4dc] theme-light:text-[#131722]">
                {asset.symbol}
              </span>
              <span className="tabular-nums font-mono text-[#d1d4dc] theme-light:text-[#131722]">
                {asset.price.toLocaleString(undefined, {
                  minimumFractionDigits: asset.price < 10 ? 4 : 2,
                  maximumFractionDigits: asset.price < 10 ? 4 : 2,
                })}
              </span>
              <span
                className={`flex items-center gap-0.5 tabular-nums font-mono text-[11px] font-medium ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
