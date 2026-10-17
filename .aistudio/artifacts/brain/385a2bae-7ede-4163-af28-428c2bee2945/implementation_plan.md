# SoundPay Pro — Android-First Payment Notification & Soundbox System

SoundPay Pro is a modern, Android-first payment notification and digital soundbox application for merchants and individuals. It securely verifies transactions through legitimate payment gateway APIs (such as Razorpay / Cashfree webhook & REST verification), announces verified payments aloud in Hindi, English, and Hinglish with configurable voice synthesis (Web Speech + Gemini AI TTS), maintains an immutable audit ledger, and provides Gemini-powered merchant financial intelligence.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were completed with recommended defaults to deliver an authentic, production-grade fintech soundbox experience:

- **Fintech Brand & Aesthetic**: SoundPay Pro styled with a sleek dark fintech merchant theme (deep midnight slate `#0B0F17`, electric emerald `#10B981` accents, and crisp typography with tabular numbers).
- **Dual Voice Announcement Engine**: Combines client-side Web Speech API (with Hindi `hi-IN` & English `en-IN` support, volume controls, speaker chimes, and instant offline fallback) with server-side Gemini TTS (`gemini-3.8-flash-lite-tts`) for high-fidelity audio broadcasts.
- **Legitimate Gateway Integration & Sandbox Simulator**: Supports standard payment gateway configurations (Razorpay key/secret, webhook secret signature verification) alongside an interactive, server-verified Payment Simulator that models authentic UPI/card gateway webhooks, signature hashing, and payer name extraction.
- **Strict Anti-Fraud Guarantee**: Voice announcements, notifications, and balance updates trigger **only** after server-side cryptographic signature verification and idempotency checks. Client-side forged payloads and duplicate notifications are blocked.

***

## 1. Overview & Core Concept

SoundPay Pro solves the "silent payment" problem for Indian shopkeepers, freelancers, and businesses. When a customer scans a UPI QR code or pays via gateway, merchants cannot constantly unlock their phone to inspect SMS or banking screens. SoundPay Pro transforms the merchant's Android device (or browser running in PWA/Soundbox mode) into an intelligent audio speaker:

1. **Instant Voice Broadcast**: Automatically announces confirmed payments (e.g., *"Rahul ki taraf se ₹500 prapt hue hain"* or *"Received 500 Rupees from Rahul"*). If payer name is omitted by the gateway, falls back cleanly to *"Aapko 500 rupaye prapt hue hain"*.
2. **Zero-Trust Payment Verification**: Listens for gateway webhooks (`/api/webhooks/payment`), validates HMAC-SHA256 signatures, checks idempotency keys to stop replay attacks, and marks payment status.
3. **Soundbox Visualizer & Persistent Playback**: Features a live speaker pulse animation, audio chime test, announcement history log, and volume controls.
4. **Gemini AI Financial Intelligence**: Summarizes today's receipts into audio/text merchant briefings, detects peak payment hours, and analyzes customer return rates using `gemini-3.8-flash`.

***

## 2. User Experience & Visual Design

### Key User Flows

1. **Onboarding & Mobile Auth Flow**:
   - Splash screen with SoundPay wave animation.
   - Clean mobile number input with Indian format (`+91`) validation.
   - 6-digit OTP verification with countdown timer, auto-fill simulation, and resend limit.
   - Profile setup (Merchant Name, Business Type, optional Email).
2. **Merchant Dashboard & Soundbox Mode**:
   - Top Bar Contract: Brand wordmark (`SoundPay Pro`), soundbox speaker status toggle, and profile trigger.
   - Hero Stat Ring & KPI Strip: Today's received revenue (`₹42,850.00`), transaction count (`38`), and live speaker status.
   - Soundbox Broadcast Banner: Visual audio wave that animates when an announcement plays.
   - Recent Transactions Feed: Tap on any transaction to open the comprehensive Transaction Detail drawer.
3. **Payment Account & Webhook Gateway Setup**:
   - Connect supported gateway (Razorpay / Cashfree / Stripe / Custom Gateway).
   - Webhook URL endpoint generator with copyable signing secret.
   - "Test Payment Trigger": Interactive sandbox modal to simulate real UPI payment events (Payer name, UPI VPA, Amount, Gateway Transaction ID) to verify voice announcements in real time.
4. **Voice & Audio Customization**:
   - Language selector: Hindi (*"Rahul ki taraf se 500 rupaye prapt hue hain"*), English (*"Received 500 Rupees from Rahul"*), Hinglish (*"Aapko 500 Rahul ki taraf se aaye hain"*).
   - Voice gender selection (Female / Male), volume slider ($0\%$ to $100\%$), speech rate, audio chime toggle, and repeat announcement toggle.
   - "Test Voice" interactive preview button.
5. **Searchable Transaction History & Filters**:
   - Filters: Today, This Week, This Month, Custom Date Range.
   - Status filters: Successful, Failed, Pending.
   - Search bar by Payer Name, Transaction ID, or UPI Ref ID.
   - Export CSV capability and Gemini Daily Financial Briefing generator.
6. **Security & Profile Settings**:
   - Session management, account deletion with confirmation modal, webhook key rotation, biometric lock preview, and data privacy disclosures.

### Visual Identity & Theme

- **Aesthetic Direction**: High-contrast, tactile Indian fintech aesthetic inspired by modern merchant soundboxes.
- **Color Palette (60-30-10 Rule)**:
  - *Canvas (60%)*: Deep obsidian midnight `#0B0F17` (Dark Mode default) and clean slate `#F8FAFC` (Light Mode toggle).
  - *Structural Surfaces (30%)*: Card backings `#131B2B` with crisp hairline borders (`rgba(255,255,255,0.08)`).
  - *Accent Budget (10%)*: Electric Emerald `#10B981` for successful payments and primary CTAs; Amber `#F59E0B` for pending; Indigo `#6366F1` for AI insights.
- **Typography**: Display sans (`Plus Jakarta Sans`) paired with tabular figures (`tabular-nums font-mono`) for exact rupee alignments.
- **Zero-Pill Discipline**: Metadata displayed as unboxed text with typographic separators (`₹500 · Today at 4:15 PM · UPI Ref 498219`).

***

## 3. Key Product Decisions & Trade-Offs

1. **Legitimate Payment Gateway Webhooks vs. Risky Notification Scraping**:
   - *Chosen Approach*: Official Payment Gateway architecture using standard webhook payloads with HMAC-SHA256 signature verification.
   - *Why*: Privacy-compliant, bank-grade reliability, and compliant with Android/Google Play and Indian financial regulations. Avoids fragile SMS or accessibility scraping.
2. **Dual-Tier Audio Announcement Engine**:
   - *Chosen Approach*: Client-side Web Speech Synthesis (Hindi `hi-IN` & English `en-IN` with synthesizer audio chime) with server-side Gemini TTS fallback (`gemini-3.8-flash-lite-tts`).
   - *Why*: Instant $<50\text{ms}$ low-latency client speech without network delay when offline, paired with studio-quality neural voice for server-triggered broadcasts.
3. **Strict Idempotency & Anti-Fraud Protection**:
   - *Chosen Approach*: Unique transaction ID hashing and state machine (`PENDING -> VERIFIED -> ANNOUNCED`).
   - *Why*: Prevents double-announcing the same payment if a webhook is retried or a merchant refreshes the view. Blocks forged client payloads.
4. **Full-Stack Express & Vite Runtime**:
   - *Chosen Approach*: Unified server with `/api` routes for authentication, webhook ingestion, transaction querying, settings storage, and Gemini AI briefing.

***

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SoundPay Pro Client                             │
│ (React 19 + Tailwind CSS + Lucide + Web Speech + Soundbox Audio Engine)     │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ HTTPS / JSON & SSE / Poll
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Node.js / Express Server                           │
│  ├─ Auth Controller: Mobile OTP Verification & JWT Session Tokens           │
│  ├─ Webhook Controller: HMAC-SHA256 Gateway Signature Verification          │
│  ├─ Transaction Service: Idempotency, Status Transition & Ledger Store      │
│  ├─ Payment Gateway Adapter: Razorpay / Cashfree / Sandbox Simulator API    │
│  ├─ Voice TTS Service: Gemini 3.8 Flash Lite TTS + Speech Template Engine   │
│  └─ Gemini AI Service: Daily Financial Briefing & Anomaly Detection        │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────────┐
│      In-Memory / Store       │ │         External Payment Gateway           │
│       Ledger Database        │ │  (Razorpay / Cashfree Webhook Dispatcher)  │
│  (Users, Txns, Settings)     │ └────────────────────────────────────────────┘
└──────────────────────────────┘
```

### Data Models

```typescript
interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  providerTransactionId: string;
  gateway: 'razorpay' | 'cashfree' | 'stripe' | 'simulator';
  senderName?: string; // Only populated when legitimately provided by gateway
  senderVpa?: string;  // e.g. "rahul@okhdfcbank" (masked for privacy)
  amount: number;
  currency: string;    // 'INR'
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  signatureVerified: boolean;
  timestamp: string;
  announcementStatus: 'PENDING' | 'ANNOUNCED' | 'FAILED' | 'MUTED';
  announcedAt?: string;
}

interface UserSettings {
  userId: string;
  language: 'hi' | 'en' | 'hinglish';
  voiceGender: 'female' | 'male';
  voiceEnabled: boolean;
  volume: number; // 0.0 to 1.0
  chimeEnabled: boolean;
  repeatAnnouncement: boolean;
  announcementTemplate: string;
  webhookSecret: string;
  connectedGateway: 'razorpay' | 'cashfree' | 'simulator' | 'none';
  gatewayApiKey?: string;
}
```

### 14 Complete Application Screens & Views

1. **Splash & Welcome View**: Soundwave pulse, quick merchant stats teaser.
2. **Mobile Login View**: Mobile number entry with Indian carrier format.
3. **OTP Verification View**: 6-digit PIN input with timer and resend.
4. **Signup / Merchant Setup**: Business name and merchant category.
5. **Home Dashboard**: Total revenue, count, speaker pulse, live transaction feed.
6. **Soundbox Visualizer Mode**: Fullscreen high-visibility kiosk display for shops.
7. **Connect Payment Account**: Razorpay/Cashfree/Stripe credentials and webhook setup.
8. **Transaction History**: Time-scoped filters, status filters, instant search.
9. **Transaction Detail Modal / Drawer**: Full cryptographic verification receipt and raw payload inspector.
10. **Voice Settings**: Language, gender, speed, template preview, volume, and test voice button.
11. **Notification Settings**: Push notification toggles, sound alerts, repeat intervals.
12. **Merchant Profile**: Business details, QR code display, account tier.
13. **Security & Compliance**: HMAC verification, API key rotation, session logout, account deletion.
14. **Help & Support**: FAQ on soundbox hardware, webhook troubleshooting, contact support.

***

## 5. Verification & Test Plan

1. **End-to-End Payment Announcement**:
   - Trigger a simulated ₹500 payment from "Rahul Sharma".
   - Verify server validates the webhook signature and returns `200 OK`.
   - Verify client receives the transaction, plays the pleasant notification chime, and speaks: *"Rahul Sharma ki taraf se aapko 500 rupaye prapt hue hain"*.
2. **Anonymous Payer Fallback**:
   - Trigger a payment where sender name is omitted.
   - Verify announcement: *"Aapko 500 rupaye prapt hue hain"*.
3. **Idempotency & Anti-Fraud**:
   - Send duplicate webhook with the same `providerTransactionId`.
   - Verify server rejects re-announcement and marks duplicate detected.
4. **Gemini AI Briefing**:
   - Request daily business summary and verify `gemini-3.8-flash` analyzes transaction velocity and generates intelligent merchant guidance.
5. **Applet Compilation**:
   - Run `compile_applet` to ensure TypeScript and Vite build cleanly with zero errors.
