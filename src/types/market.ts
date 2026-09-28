export type MarketCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: MarketCategory;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap: string;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  sector?: string;
  description: string;
  sparkline: number[];
  historicalCandles: Record<string, Candle[]>; // '1D', '5D', '1M', '1Y'
  technicalSummary: {
    sentiment: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
    score: number; // -100 to +100
    buyCount: number;
    neutralCount: number;
    sellCount: number;
    rsi: number;
    macd: number;
    ma20: number;
    ema50: number;
  };
  news: Array<{
    id: string;
    title: string;
    source: string;
    time: string;
    category: string;
  }>;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  flag: string;
  time: string;
  date: string;
  impact: 'high' | 'med' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface SectorPerformance {
  id: string;
  name: string;
  symbol: string;
  changeToday: number;
  change1W: number;
  change1M: number;
  changeYTD: number;
  marketCap: string;
  marketCapRaw: number;
  companiesCount: number;
  topStock: string;
  topStockChange: number;
}

export interface HeatmapItem {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  changePercent: number;
  price: number;
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}
