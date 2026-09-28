import React from 'react';
import { Newspaper, ExternalLink, Clock, TrendingUp } from 'lucide-react';

export const EditorialNews: React.FC = () => {
  const editorialStories = [
    {
      id: 'story-1',
      title: 'Global Liquidity Surge: How Central Bank Balance Sheets Are Reshaping Tech Valuations',
      summary: 'With coordinated policy easing cycles underway across the Federal Reserve, ECB, and PBOC, quantitative analysis reveals unprecedented institutional inflows into mega-cap AI architectures and sovereign compute infrastructure.',
      image: '/src/assets/images/market_editorial_trading_desk_1790582620028.jpg',
      category: 'Macro & Policy',
      source: 'Financial Times Markets',
      time: '42m ago',
      readTime: '4 min read',
    },
    {
      id: 'story-2',
      title: 'Precious Metals & Strategic Commodities: Gold Records Contrast With Industrial Energy Demand',
      summary: 'Gold bullion consolidates near historical highs driven by sovereign reserve diversification, while crude oil and base metals price in nuanced geopolitical shipping premiums and shifting refined product inventories.',
      image: '/src/assets/images/market_commodities_gold_energy_1790582638805.jpg',
      category: 'Commodities',
      source: 'Bloomberg Intelligence',
      time: '1h ago',
      readTime: '6 min read',
    },
  ];

  const marketWire = [
    { id: 'w1', title: 'NVIDIA suppliers expand Taiwan and Arizona packaging lines for next-generation AI accelerators', time: '12m ago', source: 'Reuters' },
    { id: 'w2', title: 'Eurozone private sector activity stabilizes above 50 contraction threshold for second month', time: '28m ago', source: 'Dow Jones' },
    { id: 'w3', title: 'Treasury auction registers 2.6x bid-to-cover ratio indicating resilient sovereign debt absorption', time: '45m ago', source: 'Bloomberg' },
    { id: 'w4', title: 'Bitcoin network hash difficulty adjusts upward by 2.1% reflecting steady infrastructure investment', time: '1h ago', source: 'CoinDesk' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722] flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#2962ff]" />
          <span>Market Insights & Editorial Analysis</span>
        </h3>
        <p className="text-xs text-[#787b86]">
          Curated institutional dispatches and real-time financial newswire
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Two Featured Big Editorial Cards with Images */}
        {editorialStories.map((story) => (
          <div
            key={story.id}
            className="group rounded-xl border border-[#2a2e39] bg-[#1e222d] overflow-hidden flex flex-col hover:border-[#2962ff]/50 transition-all theme-light:bg-white theme-light:border-[#e0e3eb]"
          >
            {/* Image banner with robust fallback */}
            <div className="relative aspect-video w-full bg-[#131722] overflow-hidden">
              <img
                src={story.image}
                alt={story.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container if image cannot load
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e222d] via-transparent to-transparent opacity-80 theme-light:from-white" />
              <div className="absolute top-3 left-3 text-[11px] font-semibold text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded">
                {story.category}
              </div>
            </div>

            {/* Story Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors leading-snug theme-light:text-[#131722]">
                  {story.title}
                </h4>
                <p className="text-xs text-[#787b86] mt-2 line-clamp-2 leading-relaxed">
                  {story.summary}
                </p>
              </div>

              {/* Unboxed Metadata with separators */}
              <div className="flex items-center gap-2 text-xs text-[#787b86] pt-2 border-t border-[#2a2e39] theme-light:border-[#e0e3eb]">
                <span className="font-medium text-[#d1d4dc] theme-light:text-[#131722]">{story.source}</span>
                <span aria-hidden="true">·</span>
                <span>{story.time}</span>
                <span aria-hidden="true">·</span>
                <span>{story.readTime}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Real-time Wire Feed */}
        <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] p-4 flex flex-col justify-between space-y-3 theme-light:bg-white theme-light:border-[#e0e3eb]">
          <div className="flex items-center justify-between border-b border-[#2a2e39] pb-2 theme-light:border-[#e0e3eb]">
            <span className="font-bold text-xs uppercase tracking-wider text-[#d1d4dc] theme-light:text-[#131722]">
              Live Wire Feeds
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#089981] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#089981] animate-ping" />
              Real-time
            </span>
          </div>

          <div className="divide-y divide-[#2a2e39] theme-light:divide-[#e0e3eb] flex-1">
            {marketWire.map((item) => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 group cursor-pointer">
                <p className="text-xs text-[#d1d4dc] group-hover:text-[#2962ff] transition-colors leading-snug theme-light:text-[#131722]">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#787b86] mt-1">
                  <span>{item.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2a2e39] text-center theme-light:border-[#e0e3eb]">
            <span className="text-[11px] text-[#787b86]">
              Synchronized with Bloomberg & Reuters financial term APIs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
