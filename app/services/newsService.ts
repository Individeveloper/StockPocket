/**
 * News API Service
 * Mengambil berita finansial dan ekonomi terkini
 * API: https://newsapi.org
 */

const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || '';
const API_ENDPOINT = 'https://newsapi.org/v2/everything';
const IS_NEWS_ENABLED = API_KEY && API_KEY !== 'YOUR_NEWS_API_KEY_HERE';

export interface NewsArticle {
  id?: string;
  title: string;
  description: string | null;
  source: {
    name: string;
  };
  author: string | null;
  publishedAt: string;
  url: string;
  image?: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

class NewsService {
  /**
   * Search untuk berita finansial/saham
   */
  async searchFinancialNews(query: string = 'saham ekonomi', limit: number = 5): Promise<NewsArticle[]> {
    try {
      if (!API_KEY) {
        console.warn('News API key tidak dikonfigurasi');
        return [];
      }

      // Build query untuk berita finansial Indonesia
      const searchQuery = `${query} saham OR pasar OR investasi OR ekonomi`;
      
      const params = new URLSearchParams({
        q: searchQuery,
        language: 'id', // Bahasa Indonesia
        sortBy: 'publishedAt',
        pageSize: limit.toString(),
        apiKey: API_KEY,
      });

      const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        console.error('News API Error:', error);
        console.warn(`News API Status: ${response.status}, Message: ${error.message || 'Unknown error'}`);
        console.warn('Please check your News API key at https://newsapi.org/account');
        return [];
      }

      const data: NewsResponse = await response.json();

      if (data.status !== 'ok' || !data.articles) {
        console.warn('Invalid News API response');
        return [];
      }

      // Filter dan format articles
      return data.articles
        .filter(article => article.title && article.description)
        .map((article, index) => ({
          ...article,
          id: `news_${Date.now()}_${index}`,
        }));

    } catch (error) {
      console.error('News Service Error:', error);
      return [];
    }
  }

  /**
   * Get berita pasar terkini untuk konteks Gemini
   */
  async getMarketContext(limit: number = 3): Promise<string> {
    try {
      const news = await this.searchFinancialNews('pasar modal saham Indonesia', limit);

      if (news.length === 0) {
        return 'Tidak ada berita pasar terkini tersedia.';
      }

      // Format berita untuk konteks
      const newsText = news
        .map(
          (article, i) =>
            `${i + 1}. **${article.title}**\n` +
            `   Sumber: ${article.source.name}\n` +
            `   ${article.description || article.content || 'Tidak ada deskripsi'}\n` +
            `   Waktu: ${new Date(article.publishedAt).toLocaleString('id-ID')}`
        )
        .join('\n\n');

      return `## 📰 Berita Pasar Terkini\n\n${newsText}`;

    } catch (error) {
      console.error('Error getting market context:', error);
      return '';
    }
  }

  /**
   * Get berita untuk saham spesifik
   */
  async getStockNews(stockSymbol: string, limit: number = 5): Promise<NewsArticle[]> {
    try {
      return await this.searchFinancialNews(`${stockSymbol} saham`, limit);
    } catch (error) {
      console.error('Error getting stock news:', error);
      return [];
    }
  }

  /**
   * Get berita ekonomi makro
   */
  async getMacroEconomicNews(limit: number = 5): Promise<NewsArticle[]> {
    try {
      return await this.searchFinancialNews('inflasi BI suku bunga ekonomi Indonesia', limit);
    } catch (error) {
      console.error('Error getting macro news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
export default newsService;
