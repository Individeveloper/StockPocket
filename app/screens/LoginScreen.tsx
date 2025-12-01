/**
 * Login Screen
 * Google Sign-In using Firebase Auth with Popup (Web) or Expo Auth Session (Native)
 */

import { FontAwesome } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { GradientContainer } from '../components/GradientContainer';
import { auth } from '../config/firebase';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Complete auth session for native
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
const WEB_CLIENT_ID = '455217827054-h25hpbq3poh73gglf9h9op5dbpt7e4c9.apps.googleusercontent.com';
// Android Client ID - untuk standalone build
const ANDROID_CLIENT_ID = '455217827054-l7ap13uupfqhqqq0catsd1riq9lma89o.apps.googleusercontent.com';
const IOS_CLIENT_ID = ''; // Add your iOS OAuth Client ID here

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // For Expo Go, we MUST use the proxy
  // For standalone builds, use native redirect
  const redirectUri = isExpoGo
    ? AuthSession.makeRedirectUri({ useProxy: true })
    : AuthSession.makeRedirectUri({ scheme: 'stockpocket', path: 'auth' });

  console.log('🔑 Auth Config:', { isExpoGo, redirectUri });

  // Native Google Auth (for Android/iOS)
  // For Expo Go: use only webClientId with proxy
  // For standalone: use androidClientId for native flow
  const [request, response, promptAsync] = Google.useAuthRequest(
    isExpoGo
      ? {
          clientId: WEB_CLIENT_ID,
          scopes: ['profile', 'email'],
        }
      : {
          clientId: WEB_CLIENT_ID,
          androidClientId: ANDROID_CLIENT_ID,
          iosClientId: IOS_CLIENT_ID || undefined,
          scopes: ['profile', 'email'],
        }
  );

  // Handle native auth response
  useEffect(() => {
    if (response?.type === 'success') {
      // Get access token and fetch user info
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleNativeGoogleSignIn(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('Native Google Auth Error:', response.error);
      Alert.alert('Error', 'Gagal login dengan Google. Silakan coba lagi.');
      setIsSigningIn(false);
    } else if (response?.type === 'dismiss') {
      setIsSigningIn(false);
    }
  }, [response]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading]);

  // Handle native sign in with access token
  const handleNativeGoogleSignIn = async (accessToken: string) => {
    try {
      // Get ID token from Google using access token
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      // Use access token to create credential
      const credential = GoogleAuthProvider.credential(null, accessToken);
      const result = await signInWithCredential(auth, credential);
      console.log('Native login successful:', result.user.email);
      router.replace('/');
    } catch (error: any) {
      console.error('Native sign in error:', error);
      Alert.alert('Error', error.message || 'Gagal login. Silakan coba lagi.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google Sign-In handler
  const handleGooglePress = async () => {
    try {
      setIsSigningIn(true);
      
      if (Platform.OS === 'web') {
        // Use Firebase signInWithPopup for web
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(auth, provider);
        console.log('Web login successful:', result.user.email);
        router.replace('/');
      } else {
        // Use expo-auth-session for native (Android/iOS)
        // Must use proxy for Expo Go
        await promptAsync(isExpoGo ? { useProxy: true } : undefined);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Popup closed by user');
      } else if (error.code === 'auth/popup-blocked') {
        Alert.alert('Popup Diblokir', 'Izinkan popup di browser Anda untuk login dengan Google.');
      } else {
        Alert.alert('Error', error.message || 'Gagal login. Silakan coba lagi.');
      }
      setIsSigningIn(false);
    }
  };

  if (authLoading) {
    return (
      <GradientContainer variant="vibrant">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Memuat...</Text>
          </View>
        </SafeAreaView>
      </GradientContainer>
    );
  }

  return (
    <GradientContainer variant="vibrant">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <FontAwesome name="line-chart" size={60} color={Colors.white} />
            </View>
            <Text style={styles.appName}>StockPocket</Text>
            <Text style={styles.tagline}>Financial Advisor AI Assistant</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Selamat Datang!</Text>
            <Text style={styles.welcomeDescription}>
              Login untuk menyimpan riwayat chat Anda dan mengakses dari perangkat manapun
            </Text>
          </View>

          {/* Login Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.googleButton, isSigningIn && styles.buttonDisabled]}
              onPress={handleGooglePress}
              disabled={isSigningIn}
              activeOpacity={0.8}
            >
              {isSigningIn ? (
                <ActivityIndicator color={Colors.text} size="small" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <FontAwesome name="google" size={20} color="#DB4437" />
                  </View>
                  <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              Dengan masuk, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami
            </Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <FontAwesome name="cloud" size={16} color={Colors.accentLight} />
              <Text style={styles.featureText}>Sync data antar perangkat</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome name="lock" size={16} color={Colors.accentLight} />
              <Text style={styles.featureText}>Data aman & terenkripsi</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome name="history" size={16} color={Colors.accentLight} />
              <Text style={styles.featureText}>Akses riwayat chat kapanpun</Text>
            </View>
          </View>
        </View>
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
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    ...Typography.heading1,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.accentLight,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  welcomeTitle: {
    ...Typography.heading2,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  welcomeDescription: {
    ...Typography.body,
    color: Colors.accentXLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonSection: {
    marginBottom: Spacing.xl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    marginRight: Spacing.md,
  },
  googleButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  termsText: {
    ...Typography.caption,
    color: Colors.accentXLight,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  featuresSection: {
    marginTop: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.accentLight,
    marginLeft: Spacing.sm,
  },
});

export default LoginScreen;
