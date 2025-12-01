/**
 * Firestore Service
 * Handles chat data storage in Firebase Firestore
 * Replaces AsyncStorage for cloud sync
 */

import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChatSession, Message } from '../types';
import { authService } from './authService';

/**
 * Remove undefined values from an object (Firestore doesn't support undefined)
 */
function removeUndefined<T extends object>(obj: T): T {
  const cleaned = {} as T;
  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (Array.isArray(obj[key])) {
        // Clean arrays recursively
        cleaned[key] = (obj[key] as any[]).map(item => 
          typeof item === 'object' && item !== null ? removeUndefined(item) : item
        ) as any;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Clean nested objects
        cleaned[key] = removeUndefined(obj[key] as object) as any;
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
}

/**
 * Clean message for Firestore storage
 */
function cleanMessage(msg: Message): object {
  return removeUndefined({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    timestamp: msg.timestamp,
    attachments: msg.attachments?.map(att => removeUndefined({
      id: att.id,
      name: att.name,
      type: att.type,
      size: att.size,
      mimeType: att.mimeType,
      // Don't store large base64 content in Firestore
      uri: att.uri || '',
    })) || [],
    sources: msg.sources?.map(src => ({
      uri: src.uri || '',
      title: src.title || '',
    })) || [],
  });
}

class FirestoreService {
  /**
   * Get current user ID
   */
  private getUserId(): string {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return user.uid;
  }

  /**
   * Get user's chats collection reference
   */
  private getChatsRef() {
    return collection(db, 'users', this.getUserId(), 'chats');
  }

  /**
   * Save a chat session to Firestore
   */
  async saveChatSession(session: ChatSession): Promise<void> {
    try {
      const userId = this.getUserId();
      const chatRef = doc(db, 'users', userId, 'chats', session.id);
      
      // Clean messages to remove undefined values
      const cleanedMessages = session.messages.map(msg => cleanMessage(msg));
      
      // Clean attachments
      const cleanedAttachments = (session.attachments || []).map(att => removeUndefined({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        mimeType: att.mimeType,
        uri: att.uri || '',
      }));
      
      await setDoc(chatRef, {
        title: session.title || 'Chat Baru',
        messages: cleanedMessages,
        attachments: cleanedAttachments,
        createdAt: session.createdAt || Date.now(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log('✅ Chat saved to Firestore:', session.id);
    } catch (error) {
      console.error('❌ Error saving chat:', error);
      throw error;
    }
  }

  /**
   * Get all chat sessions for current user
   */
  async getAllChatSessions(): Promise<ChatSession[]> {
    try {
      const chatsRef = this.getChatsRef();
      const q = query(chatsRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);

      const sessions: ChatSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          title: data.title,
          messages: data.messages || [],
          attachments: data.attachments || [],
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
        });
      });

      return sessions;
    } catch (error) {
      console.error('❌ Error getting chats:', error);
      return [];
    }
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const userId = this.getUserId();
      const chatRef = doc(db, 'users', userId, 'chats', sessionId);
      const snapshot = await getDoc(chatRef);

      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data.title,
        messages: data.messages || [],
        attachments: data.attachments || [],
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
      };
    } catch (error) {
      console.error('❌ Error getting chat:', error);
      return null;
    }
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      const chatRef = doc(db, 'users', userId, 'chats', sessionId);
      await deleteDoc(chatRef);
      console.log('✅ Chat deleted:', sessionId);
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      throw error;
    }
  }

  /**
   * Add a message to a chat session
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
      console.error('❌ Error adding message:', error);
      throw error;
    }
  }

  /**
   * Create a new empty session
   */
  createNewSession(title: string = 'Chat Baru'): ChatSession {
    return {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
  async searchSessions(queryText: string): Promise<ChatSession[]> {
    try {
      const sessions = await this.getAllChatSessions();
      const lowerQuery = queryText.toLowerCase();
      return sessions.filter(s => s.title.toLowerCase().includes(lowerQuery));
    } catch (error) {
      console.error('❌ Error searching sessions:', error);
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
