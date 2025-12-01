/**
 * External Data Service
 * Updated to use FMP Stable API endpoints
 * 
 * Provides stock data, news, financial statements from FMP
 * Used as function calling tools by Gemini
 */

import Constants from 'expo-constants';

// API Keys from environment
const FMP_API_KEY = Constants.expoConfig?.extra?.FMP_API_KEY || 
                    process.env.EXPO_PUBLIC_FMP_API_KEY || 
                    'demo';

const NEWS_API_KEY = Constants.expoConfig?.extra?.NEWS_API_KEY || 
                     process.env.EXPO_PUBLIC_NEWS_API_KEY || 
                     'demo';

// Base URL for FMP Stable API
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';
const FMP_API_V3_URL = 'https://financialmodelingprep.com/api/v3';

export interface StockNewsItem {
  title: string;
  publishedDate: string;
  source: string;
  summary: string;
  url: string;
  symbol?: string;
}

export interface MacroNewsItem {
  title: string;
  publishedDate: string;
  source: string;
  summary: string;
  url: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  pe: number;
  eps: number;
  earningsAnnouncement: string;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  currency: string;
  exchange: string;
  industry: string;
  sector: string;
  country: string;
  description: string;
  ceo: string;
  website: string;
  employees: number;
  marketCap: number;
  price: number;
  beta: number;
  ipoDate: string;
}

export interface FinancialStatement {
  date: string;
  period: string;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  eps: number;
}

export interface KeyMetrics {
  symbol: string;
  date: string;
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  dividendYield: number;
  priceToSalesRatio: number;
  enterpriseValue: number;
}

/**
 * Helper function to check API key
 */
const checkApiKey = (): boolean => {
  return FMP_API_KEY && FMP_API_KEY !== 'demo';
};

/**
 * Helper function to create API error response
 */
const createApiKeyError = (action: string) => ({
  error: true,
  message: `FMP API Key is not configured. Cannot ${action}. Please get a free API key from https://site.financialmodelingprep.com/register`
});

/**
 * Fetch Stock News - DISABLED (FMP News API requires paid subscription)
 * Returns empty array - news feature not available in free tier
 */
export const fetchStockNews = async (ticker: string): Promise<StockNewsItem[]> => {
  console.log(`📰 Stock news disabled (paid feature): ${ticker}`);
  // FMP News API requires paid subscription (returns 402)
  // Return empty array instead of making API call
  return [];
};

/**
 * Fetch Macro/Economy News - DISABLED (FMP News API requires paid subscription)
 * Falls back to NewsAPI if configured
 */
export const fetchMacroNews = async (query: string = "economy"): Promise<MacroNewsItem[]> => {
  console.log(`🌍 FMP Macro news disabled (paid feature), trying NewsAPI: ${query}`);
  // FMP News API requires paid subscription (returns 402)
  // Try fallback to NewsAPI instead
  return fetchMacroNewsFromNewsAPI(query);
};

/**
 * Fallback: Fetch from NewsAPI
 */
const fetchMacroNewsFromNewsAPI = async (query: string): Promise<MacroNewsItem[]> => {
  try {
    if (!NEWS_API_KEY || NEWS_API_KEY === 'demo') {
      return [];
    }
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=id&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      return [];
    }

    return data.articles.map((item: any) => ({
      title: item.title || '',
      publishedDate: item.publishedAt || '',
      source: item.source?.name || '',
      summary: item.description || '',
      url: item.url || ''
    }));
  } catch (error) {
    console.warn("NewsAPI Error:", error);
    return [];
  }
};

/**
 * Fetch Stock Quote from FMP Stable API
 */
export const fetchStockQuote = async (ticker: string): Promise<StockQuote | null> => {
  try {
    console.log(`📊 Fetching stock quote for: ${ticker}`);
    
    if (!checkApiKey()) {
      return null;
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/quote?symbol=${ticker}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const quote = Array.isArray(data) ? data[0] : data;
    
    if (!quote) return null;
    
    return {
      symbol: quote.symbol || ticker,
      name: quote.name || quote.companyName || '',
      price: quote.price || 0,
      change: quote.change || 0,
      changesPercentage: quote.changesPercentage || 0,
      dayLow: quote.dayLow || 0,
      dayHigh: quote.dayHigh || 0,
      yearLow: quote.yearLow || 0,
      yearHigh: quote.yearHigh || 0,
      marketCap: quote.marketCap || 0,
      volume: quote.volume || 0,
      avgVolume: quote.avgVolume || 0,
      open: quote.open || 0,
      previousClose: quote.previousClose || 0,
      pe: quote.pe || 0,
      eps: quote.eps || 0,
      earningsAnnouncement: quote.earningsAnnouncement || ''
    };
  } catch (error) {
    console.error("FMP Quote Error:", error);
    return null;
  }
};

/**
 * Fetch Company Profile from FMP Stable API
 */
export const fetchCompanyProfile = async (ticker: string): Promise<CompanyProfile | null> => {
  try {
    console.log(`🏢 Fetching company profile for: ${ticker}`);
    
    if (!checkApiKey()) {
      return null;
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/profile?symbol=${ticker}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const profile = Array.isArray(data) ? data[0] : data;
    
    if (!profile) return null;
    
    return {
      symbol: profile.symbol || ticker,
      companyName: profile.companyName || profile.name || '',
      currency: profile.currency || 'USD',
      exchange: profile.exchangeShortName || profile.exchange || '',
      industry: profile.industry || '',
      sector: profile.sector || '',
      country: profile.country || '',
      description: profile.description || '',
      ceo: profile.ceo || '',
      website: profile.website || '',
      employees: parseInt(profile.fullTimeEmployees) || 0,
      marketCap: profile.mktCap || profile.marketCap || 0,
      price: profile.price || 0,
      beta: profile.beta || 0,
      ipoDate: profile.ipoDate || ''
    };
  } catch (error) {
    console.error("FMP Profile Error:", error);
    return null;
  }
};

/**
 * Fetch Income Statement from FMP Stable API
 */
export const fetchIncomeStatement = async (ticker: string, period: 'annual' | 'quarter' = 'annual', limit: number = 4): Promise<FinancialStatement[]> => {
  try {
    console.log(`📈 Fetching income statement for: ${ticker}`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/income-statement?symbol=${ticker}&period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      date: item.date || '',
      period: item.period || period,
      revenue: item.revenue || 0,
      netIncome: item.netIncome || 0,
      grossProfit: item.grossProfit || 0,
      operatingIncome: item.operatingIncome || 0,
      eps: item.eps || 0
    }));
  } catch (error) {
    console.error("FMP Income Statement Error:", error);
    return [];
  }
};

/**
 * Fetch Key Metrics from FMP Stable API
 */
export const fetchKeyMetrics = async (ticker: string): Promise<KeyMetrics | null> => {
  try {
    console.log(`📊 Fetching key metrics for: ${ticker}`);
    
    if (!checkApiKey()) {
      return null;
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/key-metrics-ttm?symbol=${ticker}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const metrics = Array.isArray(data) ? data[0] : data;
    
    if (!metrics) return null;
    
    return {
      symbol: ticker,
      date: metrics.date || new Date().toISOString(),
      peRatio: metrics.peRatioTTM || 0,
      pbRatio: metrics.pbRatioTTM || 0,
      debtToEquity: metrics.debtToEquityTTM || 0,
      currentRatio: metrics.currentRatioTTM || 0,
      roe: metrics.roeTTM || 0,
      roa: metrics.roaTTM || 0,
      dividendYield: metrics.dividendYieldTTM || 0,
      priceToSalesRatio: metrics.priceToSalesRatioTTM || 0,
      enterpriseValue: metrics.enterpriseValueTTM || 0
    };
  } catch (error) {
    console.error("FMP Key Metrics Error:", error);
    return null;
  }
};

/**
 * Fetch Historical Stock Prices from FMP Stable API
 */
export const fetchHistoricalPrices = async (ticker: string, days: number = 30): Promise<any[]> => {
  try {
    console.log(`📉 Fetching historical prices for: ${ticker}`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/historical-price-eod/light?symbol=${ticker}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Return last N days
    return data.slice(0, days).map((item: any) => ({
      date: item.date,
      price: item.close || item.price,
      volume: item.volume
    }));
  } catch (error) {
    console.error("FMP Historical Prices Error:", error);
    return [];
  }
};

/**
 * Search Stocks by Symbol or Name
 */
export const searchStocks = async (query: string): Promise<any[]> => {
  try {
    console.log(`🔍 Searching stocks for: ${query}`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/search-symbol?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      exchange: item.exchangeShortName || item.exchange,
      currency: item.currency
    }));
  } catch (error) {
    console.error("FMP Search Error:", error);
    return [];
  }
};

/**
 * Fetch Market Gainers
 */
export const fetchMarketGainers = async (): Promise<any[]> => {
  try {
    console.log(`📈 Fetching market gainers`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/biggest-gainers?apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 10) : [];
  } catch (error) {
    console.error("FMP Gainers Error:", error);
    return [];
  }
};

/**
 * Fetch Market Losers
 */
export const fetchMarketLosers = async (): Promise<any[]> => {
  try {
    console.log(`📉 Fetching market losers`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/biggest-losers?apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 10) : [];
  } catch (error) {
    console.error("FMP Losers Error:", error);
    return [];
  }
};

/**
 * Fetch Economic Indicators
 */
export const fetchEconomicIndicator = async (indicator: string = 'GDP'): Promise<any[]> => {
  try {
    console.log(`🌍 Fetching economic indicator: ${indicator}`);
    
    if (!checkApiKey()) {
      return [];
    }
    
    const response = await fetch(
      `${FMP_BASE_URL}/economic-indicators?name=${indicator}&apikey=${FMP_API_KEY}`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 10) : [];
  } catch (error) {
    console.error("FMP Economic Indicator Error:", error);
    return [];
  }
};

export default {
  fetchStockNews,
  fetchMacroNews,
  fetchStockQuote,
  fetchCompanyProfile,
  fetchIncomeStatement,
  fetchKeyMetrics,
  fetchHistoricalPrices,
  searchStocks,
  fetchMarketGainers,
  fetchMarketLosers,
  fetchEconomicIndicator
};
