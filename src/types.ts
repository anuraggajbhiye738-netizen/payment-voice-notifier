export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  merchantCategory: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  providerTransactionId: string;
  gateway: 'razorpay' | 'cashfree' | 'stripe' | 'simulator';
  senderName?: string; // Legitimate payer name if provided by gateway
  senderVpa?: string; // Masked UPI ID, e.g., "rahul@okhdfcbank"
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  signatureVerified: boolean;
  timestamp: string;
  announcementStatus: 'PENDING' | 'ANNOUNCED' | 'FAILED' | 'MUTED';
  announcedAt?: string;
  metadata?: {
    paymentMethod?: string; // 'UPI' | 'CARD' | 'NETBANKING'
    bankReference?: string;
    description?: string;
  };
}

export type AnnouncementLanguage = 'hi' | 'en' | 'hinglish';
export type VoiceGender = 'female' | 'male';

export interface UserSettings {
  userId: string;
  language: AnnouncementLanguage;
  voiceGender: VoiceGender;
  voiceEnabled: boolean;
  volume: number; // 0.0 to 1.0
  speechRate: number; // 0.7 to 1.3
  chimeEnabled: boolean;
  repeatAnnouncement: boolean;
  announcementTemplate: string;
  webhookSecret: string;
  connectedGateway: 'razorpay' | 'cashfree' | 'stripe' | 'simulator';
  gatewayApiKey?: string;
  notificationsEnabled: boolean;
  soundboxModeEnabled: boolean;
  darkMode: boolean;
}

export interface TransactionStats {
  todayAmount: number;
  todayCount: number;
  successfulCount: number;
  pendingCount: number;
  availableBalance: number;
  averageTicketSize: number;
}

export type ActiveScreen =
  | 'splash'
  | 'login'
  | 'signup'
  | 'otp'
  | 'dashboard'
  | 'soundbox_kiosk'
  | 'connect_gateway'
  | 'history'
  | 'voice_settings'
  | 'notification_settings'
  | 'profile'
  | 'security'
  | 'help_support';
