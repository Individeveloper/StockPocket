/**
 * Type definitions for the application
 * Updated: Aligned with finAdvisor architecture
 */

// ============================================
// ATTACHMENT & FILE TYPES (from finAdvisor)
// ============================================

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string without prefix
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'csv' | 'txt';
  size: number;
  uri: string;
  content: string; // Base64 (PDF/Excel) atau Text (CSV/TXT)
  mimeType: string;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  attachments?: FileAttachment[];
  sources?: GroundingSource[]; // Sources from Google Search grounding
  isPlaceholder?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  sources?: GroundingSource[];
}

// ============================================
// GROUNDING & NEWS TYPES (from finAdvisor)
// ============================================

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  source: string;
  summary?: string;
}

// ============================================
// SESSION TYPES
// ============================================

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  attachments: FileAttachment[];
}

// ============================================
// GEMINI API TYPES
// ============================================

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface FinancialContext {
  monthlyReport?: string;
  historicalData?: string;
  newsContext?: string;
  stockData?: string;
  additionalNotes?: string;
}
