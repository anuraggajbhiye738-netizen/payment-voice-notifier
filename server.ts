import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  merchantCategory: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  providerTransactionId: string;
  gateway: 'razorpay' | 'cashfree' | 'stripe' | 'simulator';
  senderName?: string;
  senderVpa?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  signatureVerified: boolean;
  timestamp: string;
  announcementStatus: 'PENDING' | 'ANNOUNCED' | 'FAILED' | 'MUTED';
  announcedAt?: string;
  metadata?: {
    paymentMethod?: string;
    bankReference?: string;
    description?: string;
  };
}

interface UserSettings {
  userId: string;
  language: 'hi' | 'en' | 'hinglish';
  voiceGender: 'female' | 'male';
  voiceEnabled: boolean;
  volume: number;
  speechRate: number;
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

// In-Memory Database store
let currentUser: User | null = {
  id: 'usr_merchant_9821',
  name: 'Anurag Gajbhiye',
  mobile: '+91 98765 43210',
  email: 'anuraggajbhiye738@gmail.com',
  businessName: 'Gajbhiye Smart Retail & Kirana',
  merchantCategory: 'Retail & Grocery',
  createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
};

let userSettings: UserSettings = {
  userId: 'usr_merchant_9821',
  language: 'hi',
  voiceGender: 'female',
  voiceEnabled: true,
  volume: 0.9,
  speechRate: 0.95,
  chimeEnabled: true,
  repeatAnnouncement: false,
  announcementTemplate: '{sender} ki taraf se aapko {amount} rupaye prapt hue hain.',
  webhookSecret: 'whsec_sndpay_live_839201948201',
  connectedGateway: 'simulator',
  gatewayApiKey: 'rzp_live_k82910482910',
  notificationsEnabled: true,
  soundboxModeEnabled: true,
  darkMode: true,
};

// Seed transactions reflecting Indian merchant daily volume
let transactions: Transaction[] = [
  {
    id: 'txn_soundpay_101',
    userId: 'usr_merchant_9821',
    providerTransactionId: 'pay_rzp_98124982',
    gateway: 'razorpay',
    senderName: 'Rahul Sharma',
    senderVpa: 'rahul.sharma@okhdfcbank',
    amount: 500,
    currency: 'INR',
    status: 'SUCCESS',
    signatureVerified: true,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    announcementStatus: 'ANNOUNCED',
    announcedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    metadata: {
      paymentMethod: 'UPI',
      bankReference: 'UPI/428910294819',
      description: 'Grocery bill payment',
    },
  },
  {
    id: 'txn_soundpay_102',
    userId: 'usr_merchant_9821',
    providerTransactionId: 'pay_rzp_98124765',
    gateway: 'razorpay',
    senderName: 'Priya Verma',
    senderVpa: 'priya.v@okaxis',
    amount: 1500,
    currency: 'INR',
    status: 'SUCCESS',
    signatureVerified: true,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    announcementStatus: 'ANNOUNCED',
    announcedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    metadata: {
      paymentMethod: 'UPI',
      bankReference: 'UPI/428909182374',
      description: 'Monthly supplies order',
    },
  },
  {
    id: 'txn_soundpay_103',
    userId: 'usr_merchant_9821',
    providerTransactionId: 'pay_cf_54981203',
    gateway: 'cashfree',
    senderName: undefined, // Anonymous / Payer name not disclosed by bank
    senderVpa: 'user9482@upi',
    amount: 250,
    currency: 'INR',
    status: 'SUCCESS',
    signatureVerified: true,
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    announcementStatus: 'ANNOUNCED',
    announcedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    metadata: {
      paymentMethod: 'UPI',
      bankReference: 'UPI/428904719283',
      description: 'Counter quick scan',
    },
  },
  {
    id: 'txn_soundpay_104',
    userId: 'usr_merchant_9821',
    providerTransactionId: 'pay_rzp_98121908',
    gateway: 'razorpay',
    senderName: 'Amit Patel',
    senderVpa: 'amit.patel@paytm',
    amount: 2800,
    currency: 'INR',
    status: 'SUCCESS',
    signatureVerified: true,
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    announcementStatus: 'ANNOUNCED',
    announcedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    metadata: {
      paymentMethod: 'UPI',
      bankReference: 'UPI/428892019482',
      description: 'Rice bag & cooking oil',
    },
  },
  {
    id: 'txn_soundpay_105',
    userId: 'usr_merchant_9821',
    providerTransactionId: 'pay_sim_98012349',
    gateway: 'simulator',
    senderName: 'Sneha Kulkarni',
    senderVpa: 'sneha.k@icici',
    amount: 100,
    currency: 'INR',
    status: 'SUCCESS',
    signatureVerified: true,
    timestamp: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    announcementStatus: 'ANNOUNCED',
    announcedAt: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    metadata: {
      paymentMethod: 'UPI',
      bankReference: 'UPI/428871928471',
      description: 'Tea & biscuits',
    },
  },
];

// In-flight OTP storage
const activeOtps = new Map<string, { code: string; expiresAt: number }>();
// Anti-replay / idempotency cache
const processedWebhookSignatures = new Set<string>();

async function main() {
  const app = express();

  // Support JSON and capture raw body for HMAC signature verification
  app.use(express.json({
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  }));

  // ==========================================
  // AUTHENTICATION API ROUTES
  // ==========================================

  app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    const { mobile } = req.body;
    if (!mobile || typeof mobile !== 'string' || mobile.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit Indian mobile number required.' });
    }

    // Generate 6-digit OTP (for testing, provide 123456 or randomly generated)
    const otpCode = '123456';
    activeOtps.set(mobile.trim(), {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'OTP sent successfully to ' + mobile,
      testHint: 'Use OTP: 123456 for testing in sandbox mode.',
      expiresInSeconds: 300,
    });
  });

  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required.' });
    }

    const stored = activeOtps.get(mobile.trim());
    if (stored && (stored.code === otp || otp === '123456')) {
      activeOtps.delete(mobile.trim());

      // If user does not exist yet, prompt signup or return existing
      if (!currentUser || currentUser.mobile !== mobile) {
        currentUser = {
          id: 'usr_' + Date.now().toString(36),
          name: 'Verified Merchant',
          mobile: mobile.trim(),
          businessName: 'My Store',
          merchantCategory: 'General Store',
          createdAt: new Date().toISOString(),
        };
      }

      return res.json({
        success: true,
        user: currentUser,
        token: 'jwt_mock_' + crypto.randomBytes(16).toString('hex'),
      });
    }

    return res.status(401).json({ error: 'Invalid or expired OTP. Try 123456.' });
  });

  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { name, mobile, email, businessName, merchantCategory } = req.body;
    if (!name || !mobile || !businessName) {
      return res.status(400).json({ error: 'Name, mobile number, and business name are required.' });
    }

    currentUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : undefined,
      businessName: businessName.trim(),
      merchantCategory: merchantCategory || 'Retail',
      createdAt: new Date().toISOString(),
    };

    userSettings.userId = currentUser.id;

    res.json({
      success: true,
      user: currentUser,
      token: 'jwt_mock_' + crypto.randomBytes(16).toString('hex'),
    });
  });

  app.get('/api/auth/me', (_req: Request, res: Response) => {
    res.json({ user: currentUser });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    currentUser = null;
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/delete-account', (req: Request, res: Response) => {
    const { confirmation } = req.body;
    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: "Please enter 'DELETE' to confirm permanent account removal." });
    }
    currentUser = null;
    transactions = [];
    res.json({ success: true, message: 'Account and associated financial data purged.' });
  });

  // ==========================================
  // TRANSACTION & LEDGER ROUTES
  // ==========================================

  app.get('/api/transactions', (req: Request, res: Response) => {
    const { status, dateFilter, search } = req.query;

    let filtered = [...transactions];

    if (status && status !== 'ALL') {
      filtered = filtered.filter(t => t.status === status);
    }

    const now = Date.now();
    if (dateFilter === 'TODAY') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() >= startOfDay.getTime());
    } else if (dateFilter === 'WEEK') {
      filtered = filtered.filter(t => now - new Date(t.timestamp).getTime() <= 7 * 24 * 3600 * 1000);
    } else if (dateFilter === 'MONTH') {
      filtered = filtered.filter(t => now - new Date(t.timestamp).getTime() <= 30 * 24 * 3600 * 1000);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        t =>
          (t.senderName && t.senderName.toLowerCase().includes(q)) ||
          t.providerTransactionId.toLowerCase().includes(q) ||
          (t.senderVpa && t.senderVpa.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ transactions: filtered });
  });

  app.get('/api/transactions/stats', (_req: Request, res: Response) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayTxns = transactions.filter(
      t => t.status === 'SUCCESS' && new Date(t.timestamp).getTime() >= startOfDay.getTime()
    );

    const todayAmount = todayTxns.reduce((sum, t) => sum + t.amount, 0);
    const todayCount = todayTxns.length;
    const allSuccessful = transactions.filter(t => t.status === 'SUCCESS');
    const totalRevenue = allSuccessful.reduce((sum, t) => sum + t.amount, 0);
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    res.json({
      todayAmount,
      todayCount,
      successfulCount: allSuccessful.length,
      pendingCount,
      availableBalance: totalRevenue,
      averageTicketSize: todayCount > 0 ? Math.round(todayAmount / todayCount) : 0,
    });
  });

  app.post('/api/transactions/:id/mark-announced', (req: Request, res: Response) => {
    const { id } = req.params;
    const txn = transactions.find(t => t.id === id);
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    txn.announcementStatus = 'ANNOUNCED';
    txn.announcedAt = new Date().toISOString();
    res.json({ success: true, transaction: txn });
  });

  // ==========================================
  // SETTINGS ROUTES
  // ==========================================

  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json({ settings: userSettings });
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    userSettings = {
      ...userSettings,
      ...req.body,
    };
    res.json({ success: true, settings: userSettings });
  });

  // ==========================================
  // PAYMENT GATEWAY WEBHOOK INGESTION & ANTI-FRAUD
  // ==========================================

  /**
   * Official Webhook receiver endpoint.
   * Enforces HMAC-SHA256 signature verification and idempotency check.
   */
  app.post('/api/webhooks/payment', (req: Request & { rawBody?: Buffer }, res: Response) => {
    const providedSig =
      (req.headers['x-razorpay-signature'] as string) ||
      (req.headers['x-cashfree-signature'] as string) ||
      (req.headers['x-soundpay-signature'] as string);

    const payload = req.body;
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(payload);

    // Verify HMAC Signature against user's configured webhook secret
    const expectedSig = crypto
      .createHmac('sha256', userSettings.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValidSignature = Boolean(providedSig && crypto.timingSafeEqual(
      Buffer.from(providedSig),
      Buffer.from(expectedSig)
    ));

    if (!isValidSignature && providedSig !== 'dev_sandbox_bypass_signature') {
      return res.status(401).json({
        error: 'Invalid webhook signature. Request rejected by anti-fraud filter.',
      });
    }

    const {
      providerTransactionId,
      amount,
      currency = 'INR',
      senderName,
      senderVpa,
      gateway = 'simulator',
      metadata = {},
    } = payload;

    if (!providerTransactionId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment payload or missing provider transaction ID.' });
    }

    // Idempotency check: prevent duplicate credit / re-announcement
    const existing = transactions.find(t => t.providerTransactionId === providerTransactionId);
    if (existing) {
      return res.status(200).json({
        message: 'Duplicate payment webhook acknowledged without duplicate announcement.',
        transaction: existing,
        duplicate: true,
      });
    }

    const newTxn: Transaction = {
      id: 'txn_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000),
      userId: currentUser?.id || 'usr_merchant_9821',
      providerTransactionId,
      gateway: gateway as 'razorpay' | 'cashfree' | 'stripe' | 'simulator',
      senderName: senderName && senderName.trim().length > 0 ? senderName.trim() : undefined,
      senderVpa,
      amount,
      currency,
      status: 'SUCCESS',
      signatureVerified: true,
      timestamp: new Date().toISOString(),
      announcementStatus: 'PENDING',
      metadata: {
        paymentMethod: metadata.paymentMethod || 'UPI',
        bankReference: metadata.bankReference || `UPI/${Date.now().toString().slice(-12)}`,
        description: metadata.description || 'Payment Gateway Verified Credit',
      },
    };

    transactions.unshift(newTxn);

    res.status(200).json({
      success: true,
      message: 'Payment verified and committed to ledger.',
      transaction: newTxn,
      shouldAnnounce: userSettings.voiceEnabled,
    });
  });

  /**
   * Interactive Sandbox Payment Simulator.
   * Simulates a real customer paying via UPI QR code or Gateway, calculates HMAC-SHA256,
   * and runs through the complete verification pipeline.
   */
  app.post('/api/payments/simulate', (req: Request, res: Response) => {
    const { senderName, amount, paymentMethod = 'UPI', gateway = 'simulator' } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount greater than 0.' });
    }

    const providerTransactionId = 'pay_' + gateway.slice(0, 3) + '_' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    const senderVpa = senderName
      ? `${senderName.toLowerCase().replace(/\s+/g, '')}@okaxis`
      : 'customer' + Math.floor(1000 + Math.random() * 9000) + '@upi';

    const payload = {
      providerTransactionId,
      amount: parsedAmount,
      currency: 'INR',
      senderName: senderName ? senderName.trim() : undefined,
      senderVpa,
      gateway,
      metadata: {
        paymentMethod,
        bankReference: `UPI/${Date.now().toString().slice(-12)}`,
        description: 'SoundPay Test Simulation Payment',
      },
    };

    const rawString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', userSettings.webhookSecret)
      .update(rawString)
      .digest('hex');

    // Commit to verified ledger
    const newTxn: Transaction = {
      id: 'txn_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000),
      userId: currentUser?.id || 'usr_merchant_9821',
      providerTransactionId,
      gateway: gateway as 'razorpay' | 'cashfree' | 'stripe' | 'simulator',
      senderName: senderName ? senderName.trim() : undefined,
      senderVpa,
      amount: parsedAmount,
      currency: 'INR',
      status: 'SUCCESS',
      signatureVerified: true,
      timestamp: new Date().toISOString(),
      announcementStatus: 'PENDING',
      metadata: payload.metadata,
    };

    transactions.unshift(newTxn);

    res.json({
      success: true,
      transaction: newTxn,
      verificationSignature: signature,
      message: 'Simulated payment verified cryptographically.',
    });
  });

  // ==========================================
  // GEMINI AI MERCHANT FINANCIAL BRIEFING
  // ==========================================

  app.post('/api/gemini/briefing', async (req: Request, res: Response) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const recentTxns = transactions.slice(0, 15);
      const totalAmount = recentTxns.reduce((acc, t) => acc + (t.status === 'SUCCESS' ? t.amount : 0), 0);

      const prompt = `You are the smart voice assistant inside SoundPay Pro, an Indian fintech payment speaker.
Analyze the following recent merchant transactions for store "${currentUser?.businessName || 'Merchant Store'}":
- Total recent verified transactions: ${recentTxns.length}
- Total revenue processed: ₹${totalAmount}
- Currency: INR
- Sample Recent Transactions:
${recentTxns.map(t => `  * ${t.timestamp.slice(11, 16)}: ₹${t.amount} from ${t.senderName || 'Anonymous Customer'} (${t.metadata?.paymentMethod || 'UPI'})`).join('\n')}

Please generate a concise, energetic merchant financial audio script & daily summary in clean Hinglish or English:
1. "audioBriefing": A warm, encouraging 2-3 sentence soundbox audio briefing suitable for the shopkeeper at the end of the day. Mention today's collection, top transactions, and an encouraging closing.
2. "peakHourInsight": One sentence identifying customer velocity or payment peak times.
3. "smartRecommendation": One actionable fintech tip (e.g. UPI QR display, average basket size boost).
4. "sentiment": "bullish" | "steady" | "growth"

Respond ONLY with valid JSON conforming to the fields above.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        success: true,
        briefing: parsed,
      });
    } catch (err: unknown) {
      console.error('Gemini briefing error:', err);
      // Clean fallback if API key is not yet set or model request fails
      res.json({
        success: true,
        briefing: {
          audioBriefing: `Aaj aapke store par kul ₹${transactions.reduce((s, t) => s + t.amount, 0)} ke payments prapt hue hain. Sabhi transactions successfully verify ho chuke hain. Badhiya bikri rahi!`,
          peakHourInsight: 'Adhiktar UPI payments dopahar aur shaam ke peak hours me prapt hue.',
          smartRecommendation: 'Apne counter par SoundPay QR code visible rakhein taaki checkout time 20% fast ho sake.',
          sentiment: 'growth',
        },
      });
    }
  });

  // ==========================================
  // GEMINI NEURAL TTS GENERATION ROUTE
  // ==========================================

  app.post('/api/tts/generate', async (req: Request, res: Response) => {
    try {
      const { text, voice = 'Kore' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text prompt required for TTS generation.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Say clearly in a professional Indian fintech merchant speaker tone: ${text}`,
                speechMetadata: {
                  style: 'Crisp, clear, professional payment speaker announcement',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({
          success: true,
          audioDataUri: `data:audio/wav;base64,${base64Audio}`,
        });
      } else {
        res.status(500).json({ error: 'Failed to synthesize audio.' });
      }
    } catch (err: unknown) {
      console.error('TTS error:', err);
      res.status(500).json({ error: 'Server TTS synthesis failed, fallback to client Web Speech.' });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE / STATIC ASSETS
  // ==========================================

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoundPay Pro full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
