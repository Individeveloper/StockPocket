/**
 * Gradient Background Component
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme';

interface GradientProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'vibrant';
  style?: ViewStyle;
}

export const GradientContainer: React.FC<GradientProps> = ({
  children,
  variant = 'primary',
  style,
}) => {
  const gradients = {
    primary: [Colors.gradient.primary[0], Colors.gradient.primary[1]],
    secondary: [Colors.gradient.secondary[0], Colors.gradient.secondary[1]],
    vibrant: [Colors.gradient.vibrant[0], Colors.gradient.vibrant[1]],
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
});
