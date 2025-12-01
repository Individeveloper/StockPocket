/**
 * Welcome/Home Screen
 */

import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from './components/Button';
import { GradientContainer } from './components/GradientContainer';
import { BorderRadius, Colors, Spacing, Typography } from './constants/theme';
import { useAuth } from './context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  const handleGetStarted = () => {
    router.replace('/(chat)/chat');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <GradientContainer variant="vibrant">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
          </View>
        </SafeAreaView>
      </GradientContainer>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <GradientContainer variant="vibrant">
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Section */}
          {user && (
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                {user.photoURL ? (
                  <View style={styles.avatarContainer}>
                    <FontAwesome name="user-circle" size={40} color={Colors.white} />
                  </View>
                ) : (
                  <View style={styles.avatarContainer}>
                    <FontAwesome name="user-circle" size={40} color={Colors.white} />
                  </View>
                )}
                <View style={styles.userTextContainer}>
                  <Text style={styles.userName}>{user.displayName || 'User'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
                <FontAwesome name="sign-out" size={18} color={Colors.accentLight} />
              </TouchableOpacity>
            </View>
          )}

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logo}>
              <FontAwesome5 name="wallet" size={50} color={Colors.white} />
            </View>
            <Text style={styles.appName}>StockPocket</Text>
            <Text style={styles.tagline}>Financial Advisor AI Assistant</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Fitur Unggulan</Text>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="bar-chart" size={24} color={Colors.white} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Analisis Saham</Text>
                <Text style={styles.featureDescription}>
                  Dapatkan insight mendalam tentang investasi saham dengan analisis teknikal dan fundamental
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="line-chart" size={24} color={Colors.white} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Makroekonomi</Text>
                <Text style={styles.featureDescription}>
                  Pahami pengaruh inflasi, suku bunga, dan faktor ekonomi lainnya
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="file-text" size={24} color={Colors.white} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Analisis Laporan Keuangan</Text>
                <Text style={styles.featureDescription}>
                  Unggah PDF atau Excel untuk analisis mendalam terhadap laporan keuangan Anda
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <FontAwesome name="comments" size={24} color={Colors.white} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Chat Interaktif</Text>
                <Text style={styles.featureDescription}>
                  Tanya apapun dalam bahasa natural dengan AI yang memahami konteks finansial
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Siap memulai?</Text>
            <Text style={styles.ctaDescription}>
              Dapatkan rekomendasi financial advisor yang dipersonalisasi dengan AI terdepan
            </Text>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button
            label="Mulai Chat"
            onPress={handleGetStarted}
            variant="secondary"
            size="lg"
            style={styles.ctaButton}
          />
          <Text style={styles.disclaimer}>
            Disclaimer: Konsultasi ini bukan financial advice resmi. Selalu konsultasikan dengan financial advisor profesional.
          </Text>
        </View>
      </SafeAreaView>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.accentLight,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    ...Typography.heading1,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.accentLight,
  },
  featuresSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.accentXLight,
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  ctaTitle: {
    ...Typography.heading2,
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  ctaDescription: {
    ...Typography.body,
    color: Colors.accentLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ctaButton: {
    marginBottom: Spacing.md,
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.accentXLight,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

