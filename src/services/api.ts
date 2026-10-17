import { Transaction, TransactionStats, User, UserSettings } from '../types';

export const api = {
  // Auth
  async sendOtp(mobile: string) {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });
    return res.json();
  },

  async verifyOtp(mobile: string, otp: string) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp }),
    });
    return res.json();
  },

  async signup(data: { name: string; mobile: string; email?: string; businessName: string; merchantCategory?: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe(): Promise<{ user: User | null }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async deleteAccount(confirmation: string) {
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation }),
    });
    return res.json();
  },

  // Transactions
  async getTransactions(params?: { status?: string; dateFilter?: string; search?: string }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.dateFilter) query.set('dateFilter', params.dateFilter);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/transactions?${query.toString()}`);
    return res.json();
  },

  async getStats(): Promise<TransactionStats> {
    const res = await fetch('/api/transactions/stats');
    return res.json();
  },

  async markAnnounced(id: string) {
    const res = await fetch(`/api/transactions/${id}/mark-announced`, { method: 'POST' });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ settings: UserSettings }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Simulate Payment
  async simulatePayment(data: { senderName?: string; amount: number; paymentMethod?: string; gateway?: string }): Promise<{
    success: boolean;
    transaction: Transaction;
    verificationSignature: string;
    message: string;
  }> {
    const res = await fetch('/api/payments/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Gemini AI Financial Briefing
  async getGeminiBriefing() {
    const res = await fetch('/api/gemini/briefing', { method: 'POST' });
    return res.json();
  },

  // Server TTS
  async generateNeuralTts(text: string, voice?: string) {
    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });
    return res.json();
  },
};
