import React, { useState } from 'react';
import { ECONOMIC_EVENTS } from '../data/mockMarketData';
import { EconomicEvent } from '../types/market';
import { Calendar, Filter, AlertCircle, Clock } from 'lucide-react';

export const EconomicCalendar: React.FC = () => {
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'med'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredEvents = ECONOMIC_EVENTS.filter((ev) => {
    if (impactFilter !== 'all' && ev.impact !== impactFilter) return false;
    if (countryFilter !== 'all' && ev.country !== countryFilter) return false;
    return true;
  });

  const countries = ['all', ...Array.from(new Set(ECONOMIC_EVENTS.map((e) => e.country)))];

  return (
    <div className="rounded-xl border border-[#2a2e39] bg-[#1e222d] overflow-hidden theme-light:bg-white theme-light:border-[#e0e3eb]">
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-3 theme-light:border-[#e0e3eb]">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#d1d4dc] theme-light:text-[#131722] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2962ff]" />
            <span>Economic Calendar & Macro Catalysts</span>
          </h3>
          <p className="text-xs text-[#787b86]">
            Scheduled central bank decisions, inflation prints, and economic releases
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Impact Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb]">
            {(['all', 'high', 'med'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                  impactFilter === imp
                    ? 'bg-[#2a2e39] text-white font-semibold shadow theme-light:bg-white theme-light:text-[#131722]'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                {imp === 'all' ? 'All Impacts' : `${imp} Impact`}
              </button>
            ))}
          </div>

          {/* Country Selector */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#131722] border border-[#2a2e39] text-[#d1d4dc] focus:outline-none focus:border-[#2962ff] theme-light:bg-[#f0f3fa] theme-light:border-[#e0e3eb] theme-light:text-[#131722]"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Economies' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#161922] text-[#787b86] border-b border-[#2a2e39] theme-light:bg-[#f8f9fd] theme-light:border-[#e0e3eb]">
              <th className="py-2.5 px-4 w-28">Date & Time</th>
              <th className="py-2.5 px-4 w-32">Country</th>
              <th className="py-2.5 px-4">Macro Event</th>
              <th className="py-2.5 px-4 text-center w-24">Impact</th>
              <th className="py-2.5 px-4 text-right w-24">Actual</th>
              <th className="py-2.5 px-4 text-right w-24">Forecast</th>
              <th className="py-2.5 px-4 text-right w-24">Prior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39] text-[#d1d4dc] theme-light:divide-[#e0e3eb] theme-light:text-[#131722]">
            {filteredEvents.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#2a2e39]/50 transition-colors">
                <td className="py-3 px-4 tabular-nums font-mono">
                  <span className="font-semibold text-white theme-light:text-[#131722] block">{ev.date}</span>
                  <span className="text-[11px] text-[#787b86] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ev.time}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{ev.flag}</span>
                    <span className="truncate">{ev.country}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-white theme-light:text-[#131722]">
                  {ev.title}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ev.impact === 'high'
                        ? 'bg-[#f23645]/20 text-[#f23645] border border-[#f23645]/40'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    }`}
                  >
                    {ev.impact}
                  </span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono font-bold text-white theme-light:text-[#131722]">
                  {ev.actual}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono text-[#787b86]">
                  {ev.forecast}
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-mono text-[#787b86]">
                  {ev.previous}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
