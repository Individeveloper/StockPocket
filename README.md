# 💰 StockPocket - AI Financial Advisor Chatbot

StockPocket adalah aplikasi chatbot financial advisor yang dibangun dengan React Native Expo. Aplikasi ini dirancang untuk memberikan konsultasi investasi saham dan analisis makroekonomi menggunakan AI (Google Gemini).

## ✨ Fitur Utama

- **💬 Chat Interaktif**: Tanya apapun tentang investasi saham, makroekonomi, atau analisis keuangan
- **📊 Analisis Saham**: Dapatkan insight mendalam tentang teknikal dan fundamental saham (FMP API)
- **📈 Makroekonomi**: Pahami pengaruh inflasi, suku bunga, dan faktor ekonomi lainnya
- **📑 Analisis Laporan Keuangan**: Unggah CSV/Excel/TXT untuk analisis mendalam
- **🔐 Google Sign-In**: Login dengan akun Google untuk sync data
- **☁️ Cloud Sync**: Simpan riwayat chat di Firestore
- **🔄 OTA Updates**: Update aplikasi tanpa perlu download ulang dari store
- **🎨 Modern UI**: Desain gradien hijau dan hitam dengan FontAwesome icons
- **⚡ Cross-Platform**: Android, iOS, dan Web

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm/yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- [Google Gemini API Key](https://ai.google.dev) (gratis)
- [Firebase Project](https://console.firebase.google.com) dengan Auth & Firestore

### Installation

1. **Clone atau navigasi ke folder project**
   ```bash
   cd StockPocket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` dan tambahkan API Keys**
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   EXPO_PUBLIC_FMP_API_KEY=your_fmp_api_key
   ```

5. **Jalankan aplikasi**
   ```bash
   npm start
   ```

   - Tekan `w` untuk web browser
   - Tekan `a` untuk Android emulator
   - Tekan `i` untuk iOS simulator
   - Atau scan QR code dengan Expo Go app

## 📁 Project Structure

```
StockPocket/
├── app/
│   ├── (chat)/                    # Chat navigation group
│   │   ├── _layout.tsx
│   │   ├── chat.tsx              # Main chat screen
│   │   └── history.tsx           # Chat history screen
│   ├── components/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── GradientContainer.tsx
│   │   ├── Header.tsx            # With logout button
│   │   ├── InputBox.tsx          # Modern input layout
│   │   └── MessageBubble.tsx
│   ├── screens/                  # Full screens
│   │   ├── ChatScreen.tsx        # Main chat with auth
│   │   ├── HistoryScreen.tsx     # Chat history with cloud sync
│   │   └── LoginScreen.tsx       # Google Sign-In
│   ├── services/                 # Business logic
│   │   ├── authService.ts        # Auth helpers
│   │   ├── externalDataService.ts # FMP Stable API
│   │   ├── fileService.ts        # File handling
│   │   ├── firestoreService.ts   # Cloud storage
│   │   ├── fmpService.ts         # FMP API wrapper
│   │   ├── geminiService.ts      # Gemini AI
│   │   ├── newsService.ts        # News API
│   │   └── storageService.ts     # AsyncStorage (guest)
│   ├── config/
│   │   └── firebase.ts           # Firebase configuration
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state provider
│   ├── constants/
│   │   ├── config.ts
│   │   └── theme.ts              # Colors, spacing, typography
│   ├── types/
│   │   └── index.ts
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Welcome screen
├── assets/                       # Images, fonts
├── app.json                      # Expo + EAS Update config
├── eas.json                      # EAS Build config
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Authentication

### Google Sign-In Setup

1. **Firebase Console** (https://console.firebase.google.com)
   - Enable Google Sign-In di Authentication
   - Setup Firestore Database

2. **Google Cloud Console** (https://console.cloud.google.com)
   - Buat OAuth Client ID untuk Web
   - Buat OAuth Client ID untuk Android (dengan SHA-1 dari EAS)
   - Tambahkan redirect URI: `https://auth.expo.io/@username/StockPocket`

3. **Konfigurasi di Code**
   - Update `app/config/firebase.ts` dengan Firebase config
   - Update `app/screens/LoginScreen.tsx` dengan OAuth Client IDs

### OAuth Client IDs
- **Web Client**: Untuk web dan Expo Go development
- **Android Client**: Untuk standalone APK (dengan SHA-1 fingerprint)
- **iOS Client**: Untuk iOS build (optional)

## 📊 API Services

### Financial Modeling Prep (FMP) - Stable API
Base URL: `https://financialmodelingprep.com/stable`

**Endpoints Gratis:**
- `/quote` - Real-time stock quotes
- `/profile` - Company profile
- `/income-statement` - Income statements
- `/balance-sheet-statement` - Balance sheets
- `/cash-flow-statement` - Cash flow
- `/key-metrics` - Key financial metrics
- `/historical-price-eod` - Historical prices
- `/search-symbol` - Symbol search
- `/biggest-gainers` - Top gainers
- `/biggest-losers` - Top losers

**Endpoints Berbayar (disabled):**
- `/news/stock` - Stock news (402 Payment Required)
- `/news/general-latest` - General news

### Google Gemini AI
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.3 (factual responses)
- Function calling untuk stock data

## 🚢 Deployment

### Build dengan EAS

```bash
# Login ke EAS
eas login

# Build preview (testing)
eas build --platform android --profile preview

# Build production
eas build --platform android --profile production
```

### OTA Updates dengan EAS Update

```bash
# Install expo-updates (sudah terinstall)
npx expo install expo-updates

# Publish update
eas update --channel production --message "Fix bug xyz"

# Cek status updates
eas update:list
```

### Kapan Pakai EAS Update vs Build Baru

| Perubahan | Metode |
|-----------|--------|
| Bug fix, UI tweak | `eas update` ⚡ |
| Tambah native library | Build baru 📱 |
| Ubah version di app.json | Build baru 📱 |
| Tambah permissions | Build baru 📱 |
| Update API key | `eas update` ⚡ |

## 🎨 Design System

### Colors
- **Primary**: Black (#000000)
- **Accent**: Emerald Green (#10B981)
- **Gradient**: Green → Black untuk background

### Icons
- **FontAwesome** icons (bukan emoji)
- Consistent icon usage across app

### Components
- Button (primary, secondary, outline, ghost)
- GradientContainer
- MessageBubble
- InputBox (modern layout)
- Header (with logout button)

## 🔧 Configuration

### Environment Variables (.env)

```env
# Required - Google Gemini API Key
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key

# Optional - FMP API Key
EXPO_PUBLIC_FMP_API_KEY=your_fmp_key

# Optional - News API Key
EXPO_PUBLIC_NEWS_API_KEY=your_news_key
```

### Firebase Config (app/config/firebase.ts)

```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 🧪 Testing

### Development
```bash
# Web (recommended for development)
npx expo start --web

# With cache clear
npx expo start --web --clear
```

### Testing Login di Expo Go
1. Tambahkan redirect URI di Google Cloud Console:
   ```
   https://auth.expo.io/@your-username/StockPocket
   ```
2. Gunakan `npx expo whoami` untuk cek username

### Testing di APK
1. Build preview: `eas build --platform android --profile preview`
2. Download APK dari EAS dashboard
3. Install di device Android

## 🐛 Troubleshooting

### "Akses Login Terblokir" di Android
- Pastikan Android Client ID sudah dibuat dengan SHA-1 yang benar
- Cek SHA-1: `eas credentials --platform android`
- Untuk Expo Go, tambahkan redirect URI Expo proxy

### "402 Payment Required" dari FMP
- Endpoint news FMP berbayar
- Sudah di-disable di code, tidak perlu action

### File Upload Tidak Berfungsi
- Check file size < 10MB
- Supported: CSV, Excel, TXT
- PDF terbatas (text-based only)

### Firestore Error "Unsupported field value: undefined"
- Sudah diperbaiki dengan data cleaning functions
- `removeUndefined()`, `cleanMessage()`, `cleanAttachment()`

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Google Gemini API](https://ai.google.dev)
- [FMP API](https://site.financialmodelingprep.com/developer/docs/stable)

## 📄 License

MIT License - bebas untuk personal dan commercial use

---

**Built with ❤️ using React Native Expo, Firebase, & Google Gemini AI**
