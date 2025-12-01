/**
 * Input Box Component with file attachment support
 */

import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { FileAttachment } from '../types';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  onAttachFile: () => void;
  onRemoveAttachment?: (fileId: string) => void;
  attachments?: FileAttachment[];
  loading?: boolean;
  parsing?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  onAttachFile,
  onRemoveAttachment,
  attachments = [],
  loading = false,
  parsing = false,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Attachments Display */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentsContent}
          >
            {attachments.map((file) => (
              <View key={file.id} style={styles.attachmentTag}>
                <FontAwesome name="file-text-o" size={14} color={Colors.accent} />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {file.name}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveAttachment?.(file.id)}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FontAwesome name="times-circle" size={16} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {!parsing && (
            <View style={styles.fileStatus}>
              <FontAwesome name="check-circle" size={12} color="#4CAF50" />
              <Text style={styles.fileStatusText}>{attachments.length} file siap</Text>
            </View>
          )}
        </View>
      )}

      {/* Main Input Area */}
      <View style={styles.inputWrapper}>
        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tanya tentang saham, ekonomi, atau analisis keuangan..."
            placeholderTextColor={Colors.textLight}
            multiline
            maxLength={1000}
            value={text}
            onChangeText={setText}
            editable={!loading}
          />
          <Text style={styles.charCount}>{text.length}/1000</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onAttachFile}
            disabled={loading || parsing}
            style={[styles.actionButton, (loading || parsing) && styles.actionButtonDisabled]}
          >
            {parsing ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <>
                <FontAwesome name="paperclip" size={16} color={Colors.accent} />
                <Text style={styles.actionButtonText}>Lampirkan</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || loading}
            style={[styles.sendButton, (!text.trim() || loading) && styles.sendButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <FontAwesome name="paper-plane" size={16} color={Colors.white} />
                <Text style={styles.sendButtonText}>Kirim</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  attachmentsWrapper: {
    marginBottom: Spacing.sm,
  },
  attachmentsContent: {
    paddingVertical: Spacing.xs,
  },
  attachmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentXLight || '#E3F2FD',
    borderRadius: BorderRadius.full,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  attachmentName: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
    maxWidth: 120,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  fileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  fileStatusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  inputWrapper: {
    gap: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accentXLight || '#E3F2FD',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  sendButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
});
