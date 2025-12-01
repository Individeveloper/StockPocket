/**
 * AsyncStorage Service for persisting chat sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatSession, Message } from '../types';

const CHAT_SESSIONS_KEY = '@StockPocket/ChatSessions';
const CURRENT_SESSION_KEY = '@StockPocket/CurrentSessionId';

class StorageService {
  /**
   * Save a new chat session
   */
  async saveChatSession(session: ChatSession): Promise<void> {
    try {
      const sessions = await this.getAllChatSessions();
      
      // Replace existing session with same id, or add new
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
  }

  /**
   * Get all chat sessions
   */
  async getAllChatSessions(): Promise<ChatSession[]> {
    try {
      const data = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  /**
   * Get a specific chat session by id
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessions = await this.getAllChatSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Error getting chat session:', error);
      return null;
    }
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllChatSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  /**
   * Add message to a session
   */
  async addMessageToSession(sessionId: string, message: Message): Promise<void> {
    try {
      const session = await this.getChatSession(sessionId);
      if (session) {
        session.messages.push(message);
        session.updatedAt = Date.now();
        await this.saveChatSession(session);
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
      throw error;
    }
  }

  /**
   * Set current active session
   */
  async setCurrentSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } catch (error) {
      console.error('Error setting current session:', error);
      throw error;
    }
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Clear all chat sessions
   */
  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_SESSIONS_KEY);
      await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  }

  /**
   * Create a new empty session
   */
  createNewSession(title: string = 'Chat Baru'): ChatSession {
    return {
      id: `session_${Date.now()}_${Math.random()}`,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attachments: [],
    };
  }

  /**
   * Search sessions by title
   */
  async searchSessions(query: string): Promise<ChatSession[]> {
    try {
      const sessions = await this.getAllChatSessions();
      const lowerQuery = query.toLowerCase();
      return sessions.filter(s => s.title.toLowerCase().includes(lowerQuery));
    } catch (error) {
      console.error('Error searching sessions:', error);
      return [];
    }
  }
}

export const storageService = new StorageService();
export default storageService;
