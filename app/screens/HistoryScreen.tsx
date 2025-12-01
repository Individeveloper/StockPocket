/**
 * Chat History Screen
 * Shows all previous chat sessions
 */

import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GradientContainer } from '../components/GradientContainer';
import { Header } from '../components/Header';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';
import { ChatSession } from '../types';

interface HistoryScreenProps {
  navigation?: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, signOut, getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  // Choose storage service based on auth status
  const storage = isAuthenticated ? firestoreService : storageService;

  // Handle back navigation
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no history, go to chat screen
      router.replace('/(chat)/chat');
    }
  };

  // Handle new chat
  const handleGoToNewChat = () => {
    // Use replace to start fresh chat without sessionId
    router.replace('/(chat)/chat');
  };

  // Handle logout
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

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const allSessions = await storage.getAllChatSessions();
      const sorted = allSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(sorted);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Gagal memuat chat history');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const handleSelectSession = async (session: ChatSession) => {
    try {
      router.push({
        pathname: '/(chat)/chat',
        params: { sessionId: session.id }
      });
    } catch (error) {
      console.error('Error selecting session:', error);
      Alert.alert('Error', 'Gagal membuka chat');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert('Hapus Chat', 'Yakin ingin menghapus chat ini?', [
      { text: 'Batal', onPress: () => {} },
      {
        text: 'Hapus',
        onPress: async () => {
          try {
            await storage.deleteChatSession(sessionId);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', 'Gagal menghapus chat');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteAllSessions = () => {
    if (sessions.length === 0) return;
    
    Alert.alert(
      'Hapus Semua Chat',
      `Yakin ingin menghapus semua ${sessions.length} chat? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          onPress: async () => {
            try {
              setLoading(true);
              // Delete all sessions one by one
              for (const session of sessions) {
                await storage.deleteChatSession(session.id);
              }
              setSessions([]);
              Alert.alert('Berhasil', 'Semua chat telah dihapus');
            } catch (error) {
              console.error('Error deleting all sessions:', error);
              Alert.alert('Error', 'Gagal menghapus semua chat');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSessionItem = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSelectSession(item)}
    >
      <View style={styles.sessionContent}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.sessionPreview} numberOfLines={2}>
          {item.messages.length > 0 ? item.messages[0].content : 'Belum ada pesan'}
        </Text>
        <View style={styles.sessionMeta}>
          <View style={styles.messageCountContainer}>
            <FontAwesome name="comment" size={12} color={Colors.accent} style={styles.messageCountIcon} />
            <Text style={styles.messageCount}>
              {item.messages.length} pesan
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.updatedAt).toLocaleDateString('id-ID')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSession(item.id)}
      >
        <FontAwesome name="trash" size={20} color={Colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <GradientContainer variant="vibrant">
      <SafeAreaView style={styles.container}>
      <Header
        title="Chat History"
        subtitle={userInfo?.displayName ? `${sessions.length} chats • ${userInfo.displayName.split(' ')[0]}` : `${sessions.length} chat${sessions.length !== 1 ? 's' : ''}`}
        onLeftPress={handleGoBack}
        onRightPress={handleGoToNewChat}
        onExtraPress={isAuthenticated ? handleLogout : undefined}
        leftIcon="arrow-left"
        rightIcon="plus"
        extraIcon="sign-out"
      />        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.centerContent}>
            <FontAwesome name="inbox" size={60} color={Colors.white} style={styles.emptyIconStyle} />
            <Text style={styles.emptyTitle}>Belum ada chat</Text>
            <Text style={styles.emptySubtitle}>
              Mulai percakapan baru untuk mendapatkan rekomendasi financial advisor
            </Text>
          </View>
        ) : (
          <>
            {/* Clear All Button */}
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleDeleteAllSessions}
            >
              <FontAwesome name="trash-o" size={14} color={Colors.error || '#ef4444'} />
              <Text style={styles.clearAllText}>Hapus Semua Chat</Text>
            </TouchableOpacity>
            
            <FlatList
              data={sessions}
              renderItem={renderSessionItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </SafeAreaView>
    </GradientContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearAllText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconStyle: {
    marginBottom: Spacing.lg,
  },
  messageCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageCountIcon: {
    marginRight: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.accentLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionContent: {
    flex: 1,
    padding: Spacing.md,
  },
  sessionTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sessionPreview: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: Typography.caption.fontSize,
    color: Colors.accent,
    fontWeight: '600',
  },
  date: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textLight,
  },
  deleteButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
});
