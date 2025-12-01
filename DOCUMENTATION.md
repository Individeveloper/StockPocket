# 📚 StockPocket - Comprehensive Documentation

**Last Updated:** November 30, 2025  
**Version:** 1.1.0  
**Status:** ✅ Production Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Authentication](#authentication)
6. [Features](#features)
7. [API Services](#api-services)
8. [File Parsing](#file-parsing)
9. [Cloud Storage](#cloud-storage)
10. [EAS Build & Update](#eas-build--update)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

**StockPocket** adalah aplikasi chatbot financial advisor yang dibangun dengan React Native Expo. Aplikasi dirancang untuk memberikan konsultasi investasi saham dan analisis makroekonomi menggunakan AI (Google Gemini).

### Main Features
- 💬 **Chat Interaktif** - Tanya apapun tentang investasi
- 📊 **Analisis Saham** - Data real-time dari FMP Stable API
- 📈 **Makroekonomi** - Pengaruh inflasi, suku bunga, dll
- 📑 **Analisis File** - Upload CSV/Excel/TXT untuk analisis
- 🔐 **Google Sign-In** - Login dengan akun Google
- ☁️ **Cloud Sync** - Simpan chat di Firestore
- 🔄 **OTA Updates** - Update tanpa download ulang dari store
- 🎨 **Modern UI** - FontAwesome icons, gradien hijau & hitam
- ⚡ **Cross-Platform** - Android, iOS, Web

### Tech Stack
- **Frontend:** React Native + Expo Router
- **AI:** Google Gemini 2.0 Flash
- **Auth:** Firebase Auth (Google Sign-In)
- **Database:** Firestore (cloud) + AsyncStorage (guest)
- **Stock Data:** Financial Modeling Prep (FMP) Stable API
- **Build:** EAS Build + EAS Update

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Google Gemini API Key (https://ai.google.dev)
- Firebase Project (https://console.firebase.google.com)

### Installation (5 min)

```bash
# 1. Navigate ke folder
cd StockPocket

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Edit .env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key
EXPO_PUBLIC_FMP_API_KEY=your_fmp_key

# 5. Run app
npm start

# Pilih platform:
# w = Web browser (recommended)
# a = Android emulator
# i = iOS simulator
```

---

## Project Structure

```
StockPocket/
├── app/
│   ├── (chat)/                    # Chat navigation group
│   │   ├── _layout.tsx
│   │   ├── chat.tsx              # Main chat screen
│   │   └── history.tsx           # Chat history screen
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Button.tsx           # Custom button
│   │   ├── GradientContainer.tsx # Gradient background
│   │   ├── Header.tsx           # Navigation header + logout
│   │   ├── InputBox.tsx         # Message input + attachments
│   │   └── MessageBubble.tsx    # Chat message display
│   │
│   ├── screens/                  # Full screens
│   │   ├── ChatScreen.tsx       # Main chat with auth
│   │   ├── HistoryScreen.tsx    # Chat history with cloud sync
│   │   └── LoginScreen.tsx      # Google Sign-In
│   │
│   ├── services/                 # Business logic
│   │   ├── authService.ts       # Auth helpers
│   │   ├── externalDataService.ts # FMP Stable API
│   │   ├── fileService.ts       # File parsing
│   │   ├── firestoreService.ts  # Firestore CRUD
│   │   ├── fmpService.ts        # FMP API wrapper
│   │   ├── geminiService.ts     # Gemini AI integration
│   │   ├── newsService.ts       # News API
│   │   └── storageService.ts    # AsyncStorage (guest mode)
│   │
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state provider
│   │
│   ├── constants/
│   │   ├── config.ts            # API configs
│   │   └── theme.ts             # Colors, spacing, typography
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   │
│   ├── utils/
│   │   └── helpers.ts           # Utility functions
│   │
│   ├── _layout.tsx              # Root layout with AuthProvider
│   └── index.tsx                # Entry/redirect screen
│
├── assets/                       # Images, fonts
├── app.json                      # Expo + EAS Update config
├── eas.json                      # EAS Build profiles
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Authentication

### Overview
StockPocket menggunakan **Firebase Auth** dengan **Google Sign-In** untuk autentikasi user.

### Flow
```
User opens app
    ↓
Check auth state (AuthContext)
    ↓
├── Authenticated → ChatScreen (Firestore storage)
└── Guest → ChatScreen (AsyncStorage storage)
    ↓
User can login anytime → LoginScreen
    ↓
Google OAuth flow (Web popup / Native redirect)
    ↓
Save to Firestore, sync data
```

### Setup Google OAuth

#### 1. Firebase Console
- Buat project di https://console.firebase.google.com
- Enable Authentication > Google Sign-In
- Setup Firestore Database

#### 2. Google Cloud Console
- Buka https://console.cloud.google.com/apis/credentials
- Buat **Web OAuth Client**:
  - Authorized redirect URIs: `https://auth.expo.io/@your-username/StockPocket`
- Buat **Android OAuth Client** (untuk APK build):
  - Package name: `com.stockpocket.app`
  - SHA-1: dari `eas credentials --platform android`

#### 3. Update Code
- `app/config/firebase.ts` - Firebase config
- `app/screens/LoginScreen.tsx` - OAuth Client IDs

### OAuth Client IDs

| Platform | Untuk | Konfigurasi |
|----------|-------|-------------|
| Web | Browser & Expo Go | Redirect URI di Google Cloud |
| Android | Standalone APK | SHA-1 fingerprint dari EAS |
| iOS | iOS build | Bundle ID (optional) |

---

## Features

### 1. Chat Interface
- Real-time typing dengan Gemini AI
- Message history dengan timestamps
- File attachments (CSV, Excel, TXT)
- Auto-title dari pesan pertama
- Logout button di header

### 2. Stock Analysis (FMP Stable API)
- Real-time quotes (`/stable/quote`)
- Company profiles (`/stable/profile`)
- Financial statements (income, balance, cash flow)
- Key metrics (PE, PB, ROE, dll)
- Historical prices
- Market movers (gainers/losers)

### 3. Chat History
- **Authenticated:** Simpan di Firestore (cloud sync)
- **Guest:** Simpan di AsyncStorage (local only)
- Delete individual / delete all
- Continue previous chat

### 4. File Parsing
Supported formats:
- ✅ CSV (100% support)
- ✅ TXT (100% support)
- ✅ Excel (80% support)
- ⚠️ PDF (50% - text-based only)

---

## API Services

### FMP Stable API
Base URL: `https://financialmodelingprep.com/stable`

**Gratis:**
```
/quote?symbol=AAPL          - Real-time quote
/profile?symbol=AAPL        - Company profile
/income-statement           - Income statement
/balance-sheet-statement    - Balance sheet
/cash-flow-statement        - Cash flow
/key-metrics                - Financial metrics
/key-metrics-ttm            - TTM metrics
/historical-price-eod       - Historical prices
/search-symbol              - Search stocks
/biggest-gainers            - Top gainers
/biggest-losers             - Top losers
```

**Berbayar (disabled):**
```
/news/stock                 - Stock news (402)
/news/general-latest        - General news (402)
```

### Google Gemini
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.3 (factual)
- Max tokens: 1500
- Function calling: Stock data tools

---

## Cloud Storage

### Firestore Structure
```
users/{userId}/
  └── chatSessions/{sessionId}
        ├── id: string
        ├── title: string
        ├── messages: Message[]
        ├── attachments: FileAttachment[]
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

### Data Cleaning
Firestore tidak mendukung `undefined` values. Data di-clean sebelum save:
```typescript
removeUndefined(obj)     // Hapus undefined dari object
cleanMessage(msg)        // Clean message object
cleanAttachment(att)     // Clean attachment object
```

---

## EAS Build & Update

### Build Profiles (eas.json)

| Profile | Tujuan | Channel |
|---------|--------|---------|
| development | Development client | development |
| preview | Internal testing | preview |
| production | Play Store/App Store | production |

### Commands

```bash
# Build
eas build --platform android --profile preview
eas build --platform android --profile production

# Update (OTA)
eas update --channel production --message "Fix bug"

# Check updates
eas update:list

# Check credentials
eas credentials --platform android
```

### Kapan Pakai Update vs Build

| Perubahan | Metode |
|-----------|--------|
| Bug fix, UI tweak | `eas update` ⚡ |
| Update API key | `eas update` ⚡ |
| Tambah native library | Build baru 📱 |
| Ubah app.json version | Build baru 📱 |
| Tambah permissions | Build baru 📱 |

---

## Configuration

### Environment Variables (.env)

```env
# Required
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Optional
EXPO_PUBLIC_FMP_API_KEY=your_fmp_key
EXPO_PUBLIC_NEWS_API_KEY=your_news_key
```

### Firebase Config (app/config/firebase.ts)

```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "stockpocket-xxx.firebaseapp.com",
  projectId: "stockpocket-xxx",
  storageBucket: "stockpocket-xxx.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

### OAuth Client IDs (LoginScreen.tsx)

```typescript
const WEB_CLIENT_ID = '...-xxx.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '...-xxx.apps.googleusercontent.com';
```

---

## Troubleshooting

### "Akses Login Terblokir" di Android/Expo Go
1. Pastikan redirect URI sudah ditambahkan:
   ```
   https://auth.expo.io/@your-username/StockPocket
   ```
2. Cek username: `npx expo whoami`
3. Untuk APK, pastikan SHA-1 benar: `eas credentials --platform android`

### "402 Payment Required" dari FMP
- Endpoint news FMP berbayar
- Sudah di-disable di code (return empty array)

### Firestore "Unsupported field value: undefined"
- Sudah fixed dengan data cleaning functions
- Semua undefined di-remove sebelum save

### File Upload Error
- Max size: 10MB
- Supported: CSV, Excel, TXT
- PDF: text-based only (limited support)

### Login Tidak Muncul Dialog di Web
- Pastikan pakai `signInWithPopup` bukan `signInWithRedirect`
- Check browser tidak block popup

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Nov 30, 2025 | Google Sign-In, Firestore, EAS Update, FMP Stable API |
| 1.0.0 | Nov 30, 2025 | File parsing, FontAwesome icons, modern UI |
| 0.9.0 | Earlier | Initial chatbot development |

---

## License

MIT License - Free for personal & commercial use

---

**Built with ❤️ using React Native Expo, Firebase, & Google Gemini API**
