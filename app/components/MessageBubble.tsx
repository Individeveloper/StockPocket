/**
 * Message Bubble Component
 * Updated: Following finAdvisor architecture
 * 
 * Features:
 * - Displays grounding sources from Google Search
 * - Shows file attachments indicator
 * - Basic markdown-like formatting (bold text)
 */

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  style?: ViewStyle;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, style }) => {
  const isUser = message.role === 'user';

  // Simple markdown-like bold text parsing (same as finAdvisor)
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  // Handle source link press
  const handleSourcePress = async (uri: string) => {
    try {
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        style,
      ]}
    >
      {/* Author Label */}
      <Text style={styles.authorLabel}>
        {isUser ? 'Anda' : 'StockPocket AI'}
      </Text>

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {/* Attachments Indicator (for user messages) */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((file, idx) => (
              <View key={idx} style={styles.attachmentTag}>
                <FontAwesome name="paperclip" size={12} color={Colors.white} style={styles.attachmentIconStyle} />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Message Content with basic formatting */}
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {renderFormattedText(message.content)}
        </Text>
      </View>

      {/* Grounding Sources (for assistant messages) - Similar to finAdvisor */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <View style={styles.sourcesLabelContainer}>
            <FontAwesome name="book" size={10} color={Colors.textLight} style={styles.sourcesLabelIcon} />
            <Text style={styles.sourcesLabel}>Sumber Referensi:</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sourcesList}
          >
            {message.sources.map((source, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.sourceChip}
                onPress={() => handleSourcePress(source.uri)}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceText} numberOfLines={1}>
                  {source.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  authorLabel: {
    ...Typography.caption,
    color: Colors.white,
    marginBottom: Spacing.xs,
    marginHorizontal: Spacing.xs,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.gray100,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    borderTopLeftRadius: 4,
  },
  text: {
    ...Typography.body,
    lineHeight: 24,
  },
  userText: {
    color: Colors.white,
    fontWeight: '500',
  },
  assistantText: {
    color: Colors.text,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.white,
    marginHorizontal: Spacing.xs,
  },
  // Attachments styles
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  attachmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  attachmentIconStyle: {
    marginRight: Spacing.xs,
  },
  attachmentName: {
    ...Typography.caption,
    color: Colors.white,
    maxWidth: 120,
  },
  // Sources styles (similar to finAdvisor)
  sourcesContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    maxWidth: '85%',
  },
  sourcesLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sourcesLabelIcon: {
    marginRight: Spacing.xs,
  },
  sourcesLabel: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sourcesList: {
    flexDirection: 'row',
  },
  sourceChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    maxWidth: 180,
  },
  sourceText: {
    ...Typography.caption,
    color: Colors.accent,
    fontSize: 11,
  },
});
