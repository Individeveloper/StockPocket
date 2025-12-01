/**
 * Chat Screen - Updated to follow finAdvisor Architecture
 * 
 * Features:
 * - Uses geminiService.generateFinancialAdvice() with function calling
 * - Properly handles file attachments as inline data
 * - Displays grounding sources from Google Search
 * - No manual context injection - let Gemini tools handle it
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View
} from 'react-native';

// Import Components & Services
import { GradientContainer } from '../components/GradientContainer';
import { Header } from '../components/Header';
import { InputBox } from '../components/InputBox';
import { MessageBubble } from '../components/MessageBubble';
import { Colors, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { fileService } from '../services/fileService';
import { firestoreService } from '../services/firestoreService';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Attachment, ChatSession, FileAttachment, Message } from '../types';

export const ChatScreen: React.FC<any> = ({ route }) => {
  const router = useRouter();
  const { isAuthenticated, signOut, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Choose storage service based on auth status
  const storage = isAuthenticated ? firestoreService : storageService;

  // Welcome message - similar to finAdvisor
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: "Halo! Saya adalah **StockPocket AI**. \n\nSaya bisa membantu Anda menganalisa pergerakan saham, tren makro ekonomi terkini, atau membaca laporan keuangan perusahaan (PDF/Excel/CSV). \n\nApa yang ingin Anda diskusikan hari ini?",
    timestamp: Date.now(),
  };

  // 1. Initialize Session
  useEffect(() => {
    const init = async () => {
      try {
        let sId = route?.params?.sessionId;
        let session: ChatSession | null = null;
        
        if (sId) {
          session = await storage.getChatSession(sId);
        }
        
        if (!session) {
          session = storage.createNewSession();
        }
        
        setCurrentSession(session);
        
        // Set messages with welcome if empty
        if (session.messages.length === 0) {
          setMessages([welcomeMessage]);
        } else {
          setMessages(session.messages);
        }
        
        setAttachments(session.attachments || []);
        
        // Initialize Gemini conversation
        geminiService.initializeConversation();
      } catch (error) {
        console.error('Init session error:', error);
        // Fallback to new session
        const session = storage.createNewSession();
        setCurrentSession(session);
        setMessages([welcomeMessage]);
      }
    };
    init();
  }, [route?.params?.sessionId, isAuthenticated]);

  // 2. Auto Scroll
  useEffect(() => {
    if (messages.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // 3. Save Session in Background
  useEffect(() => {
    if (currentSession && messages.length > 1) { // Don't save if only welcome message
      const timer = setTimeout(async () => {
        // Filter out welcome message for storage
        const messagesToSave = messages.filter(m => m.id !== 'welcome');
        
        // Generate title from first user message if still default
        let sessionTitle = currentSession.title;
        if (sessionTitle === 'Chat Baru' && messagesToSave.length > 0) {
          const firstUserMsg = messagesToSave.find(m => m.role === 'user');
          if (firstUserMsg) {
            // Take first 50 chars of user message as title
            sessionTitle = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
          }
        }
        
        try {
          await storage.saveChatSession({
            ...currentSession,
            title: sessionTitle,
            messages: messagesToSave,
            attachments,
            updatedAt: Date.now()
          });
          
          // Update local session title
          if (sessionTitle !== currentSession.title) {
            setCurrentSession(prev => prev ? { ...prev, title: sessionTitle } : null);
          }
        } catch (error) {
          console.error('Save session error:', error);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, attachments, currentSession, isAuthenticated]);

  // 4. Send Message - Following finAdvisor pattern
  const handleSendMessage = async (text: string) => {
    if (!text.trim() && attachments.length === 0) return;
    
    setLoading(true);

    // A. Add User Message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: Date.now(),
      attachments: attachments.length ? [...attachments] : undefined
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // B. Convert FileAttachments to Gemini Attachment format
      const geminiAttachments: Attachment[] = attachments.map(file => 
        fileService.convertToGeminiAttachment(file)
      );

      // C. Get previous messages (excluding welcome and current)
      const historyMessages = messages.filter(m => m.id !== 'welcome');

      // D. Call Gemini with function calling (finAdvisor pattern)
      // No manual context injection - Gemini tools handle stock/news fetching
      const response = await geminiService.generateFinancialAdvice(
        historyMessages,
        text,
        geminiAttachments
      );

      // E. Add AI Response to UI with sources
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        role: 'assistant',
        timestamp: Date.now(),
        sources: response.sources // Grounding sources from Google Search
      };
      setMessages(prev => [...prev, aiMessage]);

      // F. Clear attachments after sending
      if (attachments.length > 0) {
        setAttachments([]);
      }

    } catch (err: any) {
      console.error('Send Message Error:', err);
      Alert.alert(
        'Error',
        err.message || 'Gagal mengirim pesan. Silakan coba lagi.'
      );
      
      // Remove failed user message
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  // 5. Attach File
  const handleAttachFile = async () => {
    if (attachments.length >= 3) {
      Alert.alert('Maksimal 3 file', 'Anda sudah mencapai batas maksimal file yang dapat dilampirkan.');
      return;
    }

    setParsing(true);
    
    try {
      const file = await fileService.pickFile();
      
      if (file) {
        // Validate file
        const validation = fileService.validateFile(file);
        if (!validation.valid) {
          Alert.alert('File Tidak Valid', validation.error);
          return;
        }

        setAttachments(prev => [...prev, file]);
        console.log(`✅ File attached: ${file.name}`);
      }
    } catch (error) {
      console.error('Attach file error:', error);
      Alert.alert('Error', 'Gagal memuat file. Silakan coba lagi.');
    } finally {
      setParsing(false);
    }
  };

  // 6. Remove Attachment
  const handleRemoveAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };

  // 7. New Chat
  const handleNewChat = async () => {
    // Clear current state
    geminiService.clearHistory();
    setMessages([welcomeMessage]);
    setAttachments([]);
    
    // Create new session
    const newSession = storage.createNewSession();
    setCurrentSession(newSession);
    
    console.log('New chat started');
  };

  // 8. Navigate to History
  const handleGoToHistory = () => {
    router.push('/(chat)/history');
  };

  // 9. Logout
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Web: use window.confirm
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
      if (confirmed) {
        signOut()
          .then(() => {
            router.replace('/login');
          })
          .catch((error) => {
            console.error('Logout error:', error);
            window.alert('Gagal logout. Silakan coba lagi.');
          });
      }
    } else {
      // Native: use Alert
      Alert.alert(
        'Logout',
        'Apakah Anda yakin ingin keluar?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                router.replace('/login');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <GradientContainer variant="vibrant">
      <SafeAreaView style={styles.container}>
        <Header
          title="StockPocket AI"
          subtitle={userInfo?.displayName ? `Hi, ${userInfo.displayName.split(' ')[0]}` : 'Financial Advisor'}
          onLeftPress={handleNewChat}
          onRightPress={handleGoToHistory}
          onExtraPress={isAuthenticated ? handleLogout : undefined}
          leftIcon="plus"
          rightIcon="list-alt"
          extraIcon="sign-out"
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          
          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.loadingText}>Menganalisis...</Text>
              </View>
            </View>
          )}
          
          <InputBox
            onSendMessage={handleSendMessage}
            onAttachFile={handleAttachFile}
            attachments={attachments}
            loading={loading}
            parsing={parsing}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  loadingDots: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: 12,
  },
});