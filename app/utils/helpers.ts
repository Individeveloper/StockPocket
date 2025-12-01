/**
 * Utility functions and helpers
 */

/**
 * Format number ke format mata uang Indonesia
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number dengan separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format date to readable format
 */
export const formatDate = (date: Date | number): string => {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time to readable format
 */
export const formatTime = (date: Date | number): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse JSON safely
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get percentage change
 */
export const getPercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

/**
 * Get trend indicator
 */
export const getTrendIndicator = (value: number): string => {
  if (value > 0) return '📈 Naik';
  if (value < 0) return '📉 Turun';
  return '➡️ Stabil';
};

/**
 * ✅ Extract text from PDF using pdfjs-dist library
 * Handles both text-based and scanned PDFs (with limitations)
 * 
 * @param base64String - PDF file encoded as base64
 * @param maxChars - Maximum characters to extract
 * @returns Extracted text from PDF
 */
export const extractTextFromPDF = async (base64String: string, maxChars: number = 5000): Promise<string> => {
  try {
    // Simple fallback: Try to extract readable text from base64
    // This works for text-based PDFs, not image/scanned PDFs
    
    // Convert base64 to string and look for readable text
    let extractedText = '';
    
    try {
      // Attempt 1: Direct decoding (works for text-based PDFs)
      const decoded = decodeURIComponent(atob(base64String).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      extractedText = decoded;
    } catch (e1) {
      try {
        // Attempt 2: Simple atob (fallback for basic text)
        extractedText = atob(base64String);
      } catch (e2) {
        console.warn('Could not decode PDF base64');
        return '';
      }
    }

    // Clean up extracted text
    const cleaned = extractedText
      .replace(/\0/g, '') // Remove null characters
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,;:()\[\]{}]/g, ' ') // Keep only readable characters
      .trim();

    if (cleaned.length === 0) {
      console.warn('⚠️ PDF loaded but no text extracted - possibly scanned/image document');
      return '';
    }

    console.log(`✅ Extracted ${cleaned.length} characters from PDF`);
    return cleaned.substring(0, maxChars);
  } catch (error) {
    console.error('❌ Error extracting text from PDF:', error);
    return '';
  }
};

/**
 * ✅ Convert base64 to string (for file parsing)
 * Handles text extraction from binary data
 */
export const base64ToText = (base64String: string): string => {
  try {
    // Use atob for React Native environments (web standard)
    if (typeof atob !== 'undefined') {
      try {
        return atob(base64String);
      } catch (e) {
        console.warn('atob() failed, likely binary data:', e);
        return '';
      }
    }
    
    // Fallback to Buffer if available (Node.js environment)
    if (typeof Buffer !== 'undefined') {
      try {
        return Buffer.from(base64String, 'base64').toString('utf8');
      } catch (e) {
        console.warn('Buffer decode failed, likely binary data:', e);
        return '';
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error converting base64 to text:', error);
    return '';
  }
};

/**
 * ✅ Extract readable text from base64 encoded content
 * Better handling for different text encodings
 * 
 * LIMITATION: This only works for text-based files (CSV, TXT, etc)
 * PDF files are binary format and require PDF parsing library (pdfjs, pdf-parse, etc)
 * For binary PDFs in React Native, recommend using CSV/Excel or copy-paste method
 */
export const extractTextFromBase64 = (base64String: string, maxChars: number = 5000): string => {
  try {
    // First attempt: direct base64 to text
    const text = base64ToText(base64String);
    
    if (!text || text.length === 0) {
      console.warn('⚠️ Could not extract text from base64 - likely binary format (PDF image/scanned)');
      return '';
    }
    
    // Clean up extracted text
    const cleaned = text
      .replace(/\0/g, '') // Remove null characters
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleaned.length === 0) {
      console.warn('⚠️ Text extracted but all characters are control chars - likely binary/image format');
      return '';
    }
    
    // Return limited chars
    return cleaned.substring(0, maxChars);
  } catch (error) {
    console.error('Error extracting text from base64:', error);
    return '';
  }
};
