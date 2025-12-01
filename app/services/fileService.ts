/**
 * File Service - Updated to follow finAdvisor architecture
 * 
 * Simplified file handling with base64 conversion for Gemini inline data
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { FileAttachment, Attachment } from '../types';

// Supported MIME types for file picker
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

class FileService {
  /**
   * Read file as Base64 (for PDF/Excel - binary files)
   */
  private async readFileAsBase64(uri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            // Remove data URI header (data:application/pdf;base64,...)
            const base64Content = res.split(',')[1];
            resolve(base64Content);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Native: Use Legacy FileSystem
        return await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64'
        });
      }
    } catch (error) {
      console.error('Base64 Read Error:', error);
      throw error;
    }
  }

  /**
   * Read file as Text (for CSV/TXT files)
   */
  private async readFileAsText(uri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        return await response.text();
      } else {
        // Native: Use Legacy FileSystem
        return await FileSystem.readAsStringAsync(uri, {
          encoding: 'utf8'
        });
      }
    } catch (error) {
      console.error('Text Read Error:', error);
      throw error;
    }
  }

  /**
   * Get proper MIME type based on file extension
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'csv':
        return 'text/csv';
      case 'txt':
        return 'text/plain';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get file type category
   */
  private getFileType(fileName: string): 'pdf' | 'excel' | 'csv' | 'txt' {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'csv':
        return 'csv';
      case 'txt':
      default:
        return 'txt';
    }
  }

  /**
   * Convert string to Base64 (React Native compatible)
   */
  private stringToBase64(str: string): string {
    // Use btoa for web, or manual encoding for native
    if (typeof btoa !== 'undefined') {
      // For web environment
      return btoa(unescape(encodeURIComponent(str)));
    } else {
      // For React Native - use a simple base64 encoding
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let output = '';
      const utf8Str = unescape(encodeURIComponent(str));
      
      for (let i = 0; i < utf8Str.length; i += 3) {
        const chr1 = utf8Str.charCodeAt(i);
        const chr2 = utf8Str.charCodeAt(i + 1);
        const chr3 = utf8Str.charCodeAt(i + 2);
        
        const enc1 = chr1 >> 2;
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        const enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        const enc4 = chr3 & 63;
        
        if (isNaN(chr2)) {
          output += chars.charAt(enc1) + chars.charAt(enc2) + '==';
        } else if (isNaN(chr3)) {
          output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + '=';
        } else {
          output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
        }
      }
      
      return output;
    }
  }

  /**
   * Pick and process file - Main method
   * Returns FileAttachment with base64 content ready for Gemini
   */
  async pickFile(): Promise<FileAttachment | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_MIME_TYPES,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📂 File Selected:', file.name, file.mimeType);

        const fileName = file.name;
        const fileType = this.getFileType(fileName);
        const mimeType = this.getMimeType(fileName);
        let content = '';

        // Read content based on file type
        if (fileType === 'csv' || fileType === 'txt') {
          // Text files: read as UTF-8 text, then convert to base64 for consistency
          const textContent = await this.readFileAsText(file.uri);
          // Convert text to base64 using our helper
          content = this.stringToBase64(textContent);
        } else {
          // Binary files (PDF, Excel): read as base64
          content = await this.readFileAsBase64(file.uri);
        }

        const attachment: FileAttachment = {
          id: `file_${Date.now()}`,
          name: fileName,
          type: fileType,
          size: file.size || 0,
          uri: file.uri,
          content: content, // Base64 encoded
          mimeType: mimeType
        };

        console.log(`✅ File processed: ${fileName} (${mimeType}, ${Math.round((file.size || 0) / 1024)}KB)`);
        return attachment;
      }
      
      return null;
    } catch (error) {
      console.error('Pick File Error:', error);
      return null;
    }
  }

  /**
   * Convert FileAttachment to Gemini Attachment format
   * This is the format expected by geminiService.generateFinancialAdvice()
   */
  convertToGeminiAttachment(file: FileAttachment): Attachment {
    return {
      name: file.name,
      mimeType: file.mimeType,
      data: file.content // Already base64
    };
  }

  /**
   * Convert multiple FileAttachments to Gemini Attachment format
   */
  convertAllToGeminiAttachments(files: FileAttachment[]): Attachment[] {
    return files.map(file => this.convertToGeminiAttachment(file));
  }

  /**
   * Validate file before processing
   */
  validateFile(file: FileAttachment): { valid: boolean; error?: string } {
    // Check file size (max 10MB for PDFs, 5MB for others)
    const maxSize = file.type === 'pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File terlalu besar. Maksimal ${file.type === 'pdf' ? '10MB' : '5MB'}`
      };
    }

    // Check if content exists
    if (!file.content || file.content.length === 0) {
      return {
        valid: false,
        error: 'File kosong atau tidak dapat dibaca'
      };
    }

    return { valid: true };
  }

  /**
   * Get human-readable file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileService = new FileService();
export default fileService;