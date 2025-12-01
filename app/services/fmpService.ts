/**
 * Financial Modeling Prep (FMP) Service
 * Updated to use STABLE API endpoints
 * Features: Real-time Quotes, Profiles, Stock News, Financial Statements, Key Metrics, Market Movers
 */

const API_KEY = process.env.EXPO_PUBLIC_FMP_API_KEY || '';
const API_ENDPOINT = 'https://financialmodelingprep.com/stable';
// Pastikan API Key valid
const IS_FMP_ENABLED = API_KEY && API_KEY.length > 5;

// ============ INTERFACES ============

export interface FMPNews {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

export interface FinancialStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  // Income Statement fields
  revenue?: number;
  costOfRevenue?: number;
  grossProfit?: number;
  grossProfitRatio?: number;
  operatingIncome?: number;
  operatingIncomeRatio?: number;
  netIncome?: number;
  netIncomeRatio?: number;
  eps?: number;
  epsdiluted?: number;
  // Balance Sheet fields
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  cashAndCashEquivalents?: number;
  totalDebt?: number;
  // Cash Flow fields
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
  dividendsPaid?: number;
}

export interface KeyMetrics {
  symbol: string;
  date: string;
  calendarYear: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  dividendYield: number;
  payoutRatio: number;
  roic: number;
  roe: number;
  roa: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}

// ============ FMP SERVICE CLASS ============

class FMPService {
  /**
   * Get Real-time Quote (Stable API)
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    if (!IS_FMP_ENABLED) return null;
    try {
      const response = await fetch(`${API_ENDPOINT}/quote?symbol=${symbol}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Quote API Error:`, data.error);
        return null;
      }
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.warn(`FMP Quote Error (${symbol}):`, error);
      return null;
    }
  }

  /**
   * Get Multiple Quotes (Stable API)
   */
  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const symbolList = symbols.join(',');
      const response = await fetch(`${API_ENDPOINT}/quote?symbol=${symbolList}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Multiple Quotes API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('FMP Multiple Quotes Error:', error);
      return [];
    }
  }

  /**
   * Get Company Profile (Stable API)
   */
  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    if (!IS_FMP_ENABLED) return null;
    try {
      const response = await fetch(`${API_ENDPOINT}/profile?symbol=${symbol}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Profile API Error:`, data.error);
        return null;
      }
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.warn(`FMP Profile Error (${symbol}):`, error);
      return null;
    }
  }

  /**
   * Get Stock News - DISABLED (requires paid subscription)
   */
  async getStockNews(symbol: string, limit: number = 5): Promise<FMPNews[]> {
    console.log(`📰 Stock news disabled (paid feature): ${symbol}`);
    // FMP News API requires paid subscription (returns 402)
    return [];
  }

  /**
   * Get General Market News - DISABLED (requires paid subscription)
   */
  async getGeneralNews(limit: number = 5): Promise<FMPNews[]> {
    console.log(`🌍 General news disabled (paid feature)`);
    // FMP News API requires paid subscription (returns 402)
    return [];
  }

  /**
   * Get Income Statement (Stable API)
   */
  async getIncomeStatement(symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FinancialStatement[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/income-statement?symbol=${symbol}&period=${period}&limit=${limit}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Income Statement API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(`FMP Income Statement Error (${symbol}):`, error);
      return [];
    }
  }

  /**
   * Get Balance Sheet (Stable API)
   */
  async getBalanceSheet(symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FinancialStatement[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/balance-sheet-statement?symbol=${symbol}&period=${period}&limit=${limit}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Balance Sheet API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(`FMP Balance Sheet Error (${symbol}):`, error);
      return [];
    }
  }

  /**
   * Get Cash Flow Statement (Stable API)
   */
  async getCashFlowStatement(symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FinancialStatement[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/cash-flow-statement?symbol=${symbol}&period=${period}&limit=${limit}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Cash Flow Statement API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(`FMP Cash Flow Statement Error (${symbol}):`, error);
      return [];
    }
  }

  /**
   * Get Key Metrics (Stable API)
   */
  async getKeyMetrics(symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<KeyMetrics[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/key-metrics?symbol=${symbol}&period=${period}&limit=${limit}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Key Metrics API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(`FMP Key Metrics Error (${symbol}):`, error);
      return [];
    }
  }

  /**
   * Get Biggest Gainers (Stable API)
   */
  async getBiggestGainers(): Promise<MarketMover[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/biggest-gainers?apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Biggest Gainers API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('FMP Biggest Gainers Error:', error);
      return [];
    }
  }

  /**
   * Get Biggest Losers (Stable API)
   */
  async getBiggestLosers(): Promise<MarketMover[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/biggest-losers?apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Biggest Losers API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('FMP Biggest Losers Error:', error);
      return [];
    }
  }

  /**
   * Search Symbol (Stable API)
   */
  async searchSymbol(query: string, limit: number = 10): Promise<any[]> {
    if (!IS_FMP_ENABLED) return [];
    try {
      const response = await fetch(`${API_ENDPOINT}/search?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${API_KEY}`);
      const data = await response.json();
      if (data.error) {
        console.warn(`FMP Search API Error:`, data.error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('FMP Search Error:', error);
      return [];
    }
  }

  /**
   * Format Data untuk Injeksi ke Prompt Gemini
   */
  formatContext(quote: StockQuote | null, profile: CompanyProfile | null, news: FMPNews[] = []): string {
    let context = '';

    // 1. Data Harga
    if (quote) {
      const trend = quote.change >= 0 ? '📈 NAIK' : '📉 TURUN';
      context += `\n=== 📊 DATA REAL-TIME: ${quote.symbol} ===`;
      context += `\nHarga: $${quote.price?.toFixed(2)} (${trend} ${quote.changesPercentage?.toFixed(2)}%)`;
      context += `\nVolume: ${quote.volume?.toLocaleString()} | Avg Volume: ${quote.avgVolume?.toLocaleString()}`;
      context += `\nMarket Cap: $${((quote.marketCap || 0) / 1e9).toFixed(2)}B | PE Ratio: ${quote.pe?.toFixed(2) || 'N/A'}`;
      context += `\nRange Hari Ini: $${quote.dayLow?.toFixed(2)} - $${quote.dayHigh?.toFixed(2)}`;
      context += `\nRange 52 Minggu: $${quote.yearLow?.toFixed(2)} - $${quote.yearHigh?.toFixed(2)}`;
      context += `\nMA50: $${quote.priceAvg50?.toFixed(2)} | MA200: $${quote.priceAvg200?.toFixed(2)}`;
      context += `\nEPS: $${quote.eps?.toFixed(2) || 'N/A'}`;
    }

    // 2. Profil
    if (profile) {
      context += `\n\n=== 🏢 PROFIL PERUSAHAAN ===`;
      context += `\nNama: ${profile.companyName}`;
      context += `\nSector: ${profile.sector} | Industry: ${profile.industry}`;
      context += `\nCEO: ${profile.ceo || 'N/A'}`;
      context += `\nKaryawan: ${profile.fullTimeEmployees || 'N/A'}`;
      context += `\nNegara: ${profile.country || 'N/A'}`;
      context += `\nIPO Date: ${profile.ipoDate || 'N/A'}`;
      context += `\nWebsite: ${profile.website || 'N/A'}`;
      context += `\nDeskripsi: ${profile.description?.substring(0, 300)}...`;
    }

    // 3. Berita
    if (news && news.length > 0) {
      context += `\n\n=== 📰 BERITA TERKINI (${quote?.symbol || 'PASAR'}) ===`;
      news.forEach((n, i) => {
        context += `\n${i + 1}. [${n.publishedDate?.split(' ')[0] || 'N/A'}] ${n.title}`;
        const cleanText = n.text?.replace(/<[^>]*>?/gm, '').substring(0, 120) || '';
        if (cleanText) {
          context += `\n   Ringkasan: ${cleanText}...`;
        }
      });
    }

    return context;
  }

  /**
   * Format Key Metrics untuk Prompt
   */
  formatKeyMetricsContext(metrics: KeyMetrics[]): string {
    if (!metrics.length) return '';
    
    const latest = metrics[0];
    let context = `\n\n=== 📊 KEY METRICS (${latest.symbol}) ===`;
    context += `\nPE Ratio: ${latest.peRatio?.toFixed(2) || 'N/A'}`;
    context += `\nPB Ratio: ${latest.pbRatio?.toFixed(2) || 'N/A'}`;
    context += `\nPrice to Sales: ${latest.priceToSalesRatio?.toFixed(2) || 'N/A'}`;
    context += `\nEV/EBITDA: ${latest.enterpriseValueOverEBITDA?.toFixed(2) || 'N/A'}`;
    context += `\nROE: ${(latest.roe * 100)?.toFixed(2) || 'N/A'}%`;
    context += `\nROA: ${(latest.roa * 100)?.toFixed(2) || 'N/A'}%`;
    context += `\nROIC: ${(latest.roic * 100)?.toFixed(2) || 'N/A'}%`;
    context += `\nDebt/Equity: ${latest.debtToEquity?.toFixed(2) || 'N/A'}`;
    context += `\nCurrent Ratio: ${latest.currentRatio?.toFixed(2) || 'N/A'}`;
    context += `\nDividend Yield: ${(latest.dividendYield * 100)?.toFixed(2) || 'N/A'}%`;
    context += `\nFCF Yield: ${(latest.freeCashFlowYield * 100)?.toFixed(2) || 'N/A'}%`;
    
    return context;
  }

  /**
   * Format Market Movers untuk Prompt
   */
  formatMarketMoversContext(gainers: MarketMover[], losers: MarketMover[]): string {
    let context = '';
    
    if (gainers.length > 0) {
      context += `\n\n=== 📈 TOP GAINERS HARI INI ===`;
      gainers.slice(0, 5).forEach((g, i) => {
        context += `\n${i + 1}. ${g.symbol} (${g.name}): $${g.price?.toFixed(2)} (+${g.changesPercentage?.toFixed(2)}%)`;
      });
    }
    
    if (losers.length > 0) {
      context += `\n\n=== 📉 TOP LOSERS HARI INI ===`;
      losers.slice(0, 5).forEach((l, i) => {
        context += `\n${i + 1}. ${l.symbol} (${l.name}): $${l.price?.toFixed(2)} (${l.changesPercentage?.toFixed(2)}%)`;
      });
    }
    
    return context;
  }

  formatGeneralNewsContext(news: FMPNews[]): string {
    if (!news.length) return '';
    let context = `\n=== 🌍 BERITA EKONOMI & PASAR GLOBAL TERKINI ===`;
    news.forEach((n, i) => {
      context += `\n${i + 1}. ${n.title} (${n.publishedDate?.split(' ')[0] || 'N/A'})`;
    });
    return context;
  }
}

export const fmpService = new FMPService();
export default fmpService;