/**
 * Firebase Configuration
 * Initialize Firebase App, Auth, and Firestore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAGSEetrkJeIWAcD1jwMklCb7O8q2E9lc",
  authDomain: "stockpocket-d1a6b.firebaseapp.com",
  databaseURL: "https://stockpocket-d1a6b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stockpocket-d1a6b",
  storageBucket: "stockpocket-d1a6b.firebasestorage.app",
  messagingSenderId: "455217827054",
  appId: "1:455217827054:web:ac8313cb8efd39e07837ff",
  measurementId: "G-68KCYVY5Y2"
};

// Initialize Firebase App (prevent re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For React Native, use AsyncStorage for persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
export default app;
