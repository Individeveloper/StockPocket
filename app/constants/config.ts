/**
 * Application Configuration
 */

export const AppConfig = {
  // API Configuration
  API: {
    GEMINI_MODEL: 'gemini-pro',
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
  },

  // File Upload
  FILES: {
    MAX_SIZE_MB: 10,
    ACCEPTED_TYPES: ['pdf', 'excel', 'csv'],
    MAX_FILES: 3,
  },

  // Chat
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    MESSAGE_RETENTION_DAYS: 90,
    AUTO_SAVE_INTERVAL: 500, // milliseconds
  },

  // UI
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 500,
  },

  // Storage
  STORAGE: {
    ENCRYPTION_ENABLED: true,
    AUTO_BACKUP: true,
    BACKUP_INTERVAL_HOURS: 24,
  },
};

// Feature Flags
export const FeatureFlags = {
  enableFileUpload: true,
  enableChatHistory: true,
  enableExport: false, // Coming soon
  enableSharing: false, // Coming soon
  enableOfflineMode: false, // Coming soon
};

// API Endpoints (if using backend)
export const ApiEndpoints = {
  // Gemini is used directly, no backend needed
  // But you can add these for future extensions
  newsApi: 'https://newsapi.org/v2',
  stockApi: 'https://api.example.com/stock',
};

export default AppConfig;
