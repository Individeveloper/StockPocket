/**
 * Header Component
 */

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onExtraPress?: () => void;
  leftIcon?: string;
  rightIcon?: string;
  extraIcon?: string;
  userPhotoURL?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onLeftPress,
  onRightPress,
  onExtraPress,
  leftIcon = 'arrow-left',
  rightIcon = 'ellipsis-h',
  extraIcon,
  userPhotoURL,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {onLeftPress && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            <FontAwesome name={leftIcon as any} size={18} color={Colors.white} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.rightButtons}>
          {onRightPress && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <FontAwesome name={rightIcon as any} size={18} color={Colors.white} />
            </TouchableOpacity>
          )}
          {onExtraPress && (
            <TouchableOpacity onPress={onExtraPress} style={[styles.iconButton, styles.extraButton]}>
              <FontAwesome name={extraIcon as any || 'sign-out'} size={18} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  extraButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  title: {
    ...Typography.heading3,
    color: Colors.white,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.accentLight,
    marginTop: Spacing.xs,
  },
});
