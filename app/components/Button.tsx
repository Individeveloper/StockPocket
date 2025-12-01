/**
 * Button Component with gradient support
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const sizeStyles = {
    sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: 14 },
    md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: 16 },
    lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, fontSize: 18 },
  };

  const currentSize = sizeStyles[size];

  const variantStyles = {
    primary: {
      backgroundColor: Colors.accent,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: Colors.gray200,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: Colors.accent,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderColor: currentVariant.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.accent : Colors.white} />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: currentSize.fontSize,
                color: variant === 'outline' || variant === 'ghost' ? Colors.accent : variant === 'secondary' ? Colors.text : Colors.white,
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  buttonText: {
    ...Typography.button,
    marginLeft: Spacing.sm,
  },
});
