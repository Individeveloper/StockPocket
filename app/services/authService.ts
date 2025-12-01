/**
 * Authentication Service
 * Handles Google Sign-In using Firebase Auth
 */

import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    User
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Required for web browser auth session
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = '455217827054-h25hpbq3poh73gglf9h9op5dbpt7e4c9.apps.googleusercontent.com';

// User type export
export type AuthUser = User | null;

class AuthService {
  private currentUser: AuthUser = null;
  private authStateListeners: ((user: AuthUser) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  /**
   * Get Google Auth config for expo-auth-session
   */
  getGoogleAuthConfig() {
    return {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      // androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Add when you have Android OAuth
      // iosClientId: 'YOUR_IOS_CLIENT_ID', // Add when you have iOS OAuth
      redirectUri: makeRedirectUri({
        scheme: 'stockpocket'
      }),
    };
  }

  /**
   * Sign in with Google ID Token (from expo-auth-session)
   */
  async signInWithGoogleToken(idToken: string): Promise<User> {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      console.log('✅ Google Sign-In successful:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser {
    return this.currentUser || auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(user: AuthUser) {
    this.authStateListeners.forEach(listener => listener(user));
  }

  /**
   * Get user display info
   */
  getUserInfo() {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }
}

export const authService = new AuthService();
export default authService;
