/**
 * Gemini Service - Rewritten following finAdvisor Architecture
 * 
 * Features:
 * - Uses @google/genai SDK properly
 * - Function calling (Tools): get_stock_news, get_macro_news
 * - Google Search grounding for real-time data
 * - PDF/Excel/CSV file analysis via inline data
 * - Unbiased, data-driven responses
 */

import { FunctionDeclaration, GenerateContentResponse, GoogleGenAI, Part, Tool, Type } from "@google/genai";
import Constants from 'expo-constants';
import { Attachment, GroundingChunk, GroundingSource, Message } from "../types";
import { fetchMacroNews, fetchStockNews } from "./externalDataService";

// Get API Key from environment
const API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || 
                process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                '';

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// System Instruction - Following finAdvisor pattern
const SYSTEM_INSTRUCTION = `
Anda adalah Asisten Penasihat Keuangan (Financial Advisor Assistant) kelas dunia yang cerdas dan profesional.
Tugas utama Anda adalah membantu pengguna menganalisis pasar saham, tren makro ekonomi, dan laporan keuangan perusahaan.

Panduan Gaya & Nada:
1.  **Profesional namun Ramah:** Gunakan bahasa Indonesia yang baik, baku, namun tidak kaku.
2.  **Data-Driven:** Gunakan data yang disediakan oleh "Tools" (Berita Saham/Makro) untuk memberikan jawaban terkini. JANGAN mengarang data pasar jika tidak ada di tools.
3.  **Analisis Berita:** Jika Anda menerima data berita dari tools, rangkum poin utamanya dan jelaskan dampaknya terhadap pasar atau saham terkait.
4.  **Konteks Laporan:** Jika pengguna mengunggah file (PDF/Excel), analisislah angka-angka kunci seperti Revenue, Net Income, Total Assets, Liabilities, dan hitung rasio keuangan jika memungkinkan.
5.  **Penyangkalan (Disclaimer):** Selalu ingatkan bahwa saran Anda adalah untuk tujuan informasi dan edukasi, bukan financial advice resmi.

Tools & Sumber Data:
- Gunakan \`get_stock_news\` jika pengguna bertanya tentang saham spesifik (contoh: BBCA, ASII, AAPL, GOTO).
- Gunakan \`get_macro_news\` jika pengguna bertanya tentang kondisi ekonomi umum, inflasi, suku bunga, atau kebijakan pemerintah.
- Jika tools tidak memberikan hasil yang cukup, gunakan pengetahuan internal Anda atau Google Search grounding untuk data terkini.

Kemampuan Analisis File:
- Anda BISA membaca dan menganalisis file PDF, Excel, dan CSV yang diunggah pengguna.
- Untuk laporan keuangan, fokus pada: Revenue, Net Income, Total Assets, Total Liabilities, Equity.
- Hitung rasio seperti: Net Profit Margin, Debt-to-Equity Ratio, ROE jika data tersedia.
- Berikan kesimpulan kesehatan keuangan perusahaan berdasarkan data.
`;

// ============================================
// FUNCTION DECLARATIONS (Tools)
// ============================================

const getStockNewsTool: FunctionDeclaration = {
  name: "get_stock_news",
  description: "Mengambil berita terbaru untuk kode saham (ticker) tertentu dari Financial Modeling Prep. Gunakan ini ketika user bertanya tentang saham spesifik.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      ticker: {
        type: Type.STRING,
        description: "Kode saham (Ticker Symbol), contoh: BBCA, TLKM, AAPL, GOTO, ASII.",
      },
    },
    required: ["ticker"],
  },
};

const getMacroNewsTool: FunctionDeclaration = {
  name: "get_macro_news",
  description: "Mengambil berita makro ekonomi atau keuangan umum dari NewsAPI. Gunakan ini ketika user bertanya tentang ekonomi, inflasi, suku bunga, atau pasar secara umum.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Kata kunci pencarian berita, contoh: 'inflasi indonesia', 'the fed', 'ihsg', 'suku bunga BI'.",
      },
    },
    required: ["query"],
  },
};

// Tools configuration - function declarations only
// Note: Google Search grounding cannot be combined with function calling in gemini-2.5-flash
const tools: Tool[] = [
  {
    functionDeclarations: [getStockNewsTool, getMacroNewsTool],
  },
];

// ============================================
// MAIN SERVICE CLASS
// ============================================

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Part[];
}

class GeminiService {
  private conversationHistory: ChatHistoryItem[] = [];

  /**
   * Initialize/reset conversation
   */
  async initializeConversation(): Promise<void> {
    this.conversationHistory = [];
  }

  /**
   * Generate Financial Advice - Main method
   * Follows finAdvisor pattern with function calling loop
   */
  async generateFinancialAdvice(
    history: Message[],
    currentMessage: string,
    attachments: Attachment[] = []
  ): Promise<{ text: string; sources: GroundingSource[] }> {
    
    try {
      if (!API_KEY) {
        throw new Error('API Key Gemini tidak dikonfigurasi. Silakan set EXPO_PUBLIC_GEMINI_API_KEY di .env');
      }

      // 1. Construct past conversation history
      const pastContent: ChatHistoryItem[] = history
        .filter(msg => !msg.isPlaceholder)
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
          parts: [{ text: msg.content }],
        }));

      // 2. Prepare current message parts
      const currentParts: Part[] = [{ text: currentMessage }];

      // 3. Add attachments as inline data (PDF/Excel/CSV)
      if (attachments.length > 0) {
        attachments.forEach((att) => {
          currentParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
          console.log(`📎 Attached file: ${att.name} (${att.mimeType})`);
        });
      }

      // 4. Initial call to Gemini (may trigger function calls)
      let response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          ...pastContent,
          {
            role: 'user',
            parts: currentParts,
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: tools,
        },
      });

      // 5. Handle Function Calls (Tool Loop)
      const candidates = response.candidates;
      
      if (candidates && candidates[0]?.content?.parts) {
        const parts = candidates[0].content.parts;
        
        // Check for function calls
        const functionCalls = parts.filter(part => part.functionCall);

        if (functionCalls.length > 0) {
          const functionResponses: any[] = [];

          // Execute each function requested by Gemini
          for (const callPart of functionCalls) {
            const call = callPart.functionCall;
            if (!call) continue;

            let apiResult;
            console.log(`🔧 Executing Tool: ${call.name}`);

            if (call.name === 'get_stock_news') {
              const args = call.args as { ticker: string };
              apiResult = await fetchStockNews(args.ticker);
              console.log(`📊 Stock news result for ${args.ticker}:`, apiResult.length, 'articles');
            } else if (call.name === 'get_macro_news') {
              const args = call.args as { query: string };
              apiResult = await fetchMacroNews(args.query);
              console.log(`🌍 Macro news result for "${args.query}":`, apiResult.length, 'articles');
            } else {
              apiResult = { error: "Unknown function" };
            }

            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { result: apiResult },
                id: call.id
              }
            });
          }

          // 6. Send function results back to Gemini for final response
          response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
              ...pastContent,
              { role: 'user', parts: currentParts },
              { role: 'model', parts: parts }, // Model's request to call tools
              { role: 'user', parts: functionResponses } // Tool results
            ],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools: tools,
            }
          });
        }
      }

      // 7. Extract final text response
      const text = response.text || "Maaf, saya tidak dapat menghasilkan respon saat ini.";

      // 8. Extract sources from grounding metadata (Google Search)
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      const sources: GroundingSource[] = [];

      if (chunks) {
        chunks.forEach((chunk) => {
          if (chunk.web) {
            sources.push({
              uri: chunk.web.uri,
              title: chunk.web.title || new URL(chunk.web.uri).hostname,
            });
          }
        });
      }

      // 9. Update internal history
      this.conversationHistory.push(
        { role: 'user', parts: currentParts },
        { role: 'model', parts: [{ text }] }
      );

      return { text, sources };

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Provide helpful error messages
      let errorMessage = "Maaf, terjadi kesalahan saat menghubungkan ke layanan AI.";
      
      if (error.message?.includes('API Key')) {
        errorMessage = "API Key tidak valid atau belum dikonfigurasi. Silakan cek EXPO_PUBLIC_GEMINI_API_KEY di file .env";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "Kuota API habis. Silakan coba lagi nanti atau upgrade plan API Anda.";
      }
      
      return {
        text: errorMessage,
        sources: []
      };
    }
  }

  /**
   * Simple send message (wrapper for backward compatibility)
   */
  async sendMessage(userMessage: string, attachments: Attachment[] = []): Promise<string> {
    const result = await this.generateFinancialAdvice([], userMessage, attachments);
    return result.text;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert File to Base64 (for React Native)
 */
export const fileToBase64 = async (uri: string): Promise<string> => {
  try {
    // For React Native, we use fetch to get blob then convert
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("Error converting file to base64:", error);
    throw error;
  }
};

/**
 * Convert FileAttachment to Attachment format for Gemini
 */
export const convertToGeminiAttachment = (file: { 
  name: string; 
  mimeType: string; 
  content: string; 
}): Attachment => {
  return {
    name: file.name,
    mimeType: file.mimeType,
    data: file.content, // Already base64
  };
};

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;