import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, ShieldCheck, Radio, Check, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { User, ActiveScreen } from '../types';
import { api } from '../services/api';

interface AuthViewsProps {
  currentScreen: 'splash' | 'login' | 'signup' | 'otp';
  onNavigate: (screen: ActiveScreen) => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthViews: React.FC<AuthViewsProps> = ({
  currentScreen,
  onNavigate,
  onAuthSuccess,
}) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('Retail & Grocery');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentScreen === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen, timer]);

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(mobile.trim());
      if (res.success) {
        setTimer(30);
        onNavigate('otp');
      } else {
        setError(res.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Network error while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile.trim(), otp.trim());
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onNavigate('dashboard');
      } else {
        setError(res.error || 'Invalid OTP. For test sandbox, use 123456.');
      }
    } catch {
      setError('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !businessName.trim() || !mobile.trim()) {
      setError('Please fill in your name, store name, and mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : undefined,
        businessName: businessName.trim(),
        merchantCategory,
      });

      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onNavigate('dashboard');
      } else {
        setError(res.error || 'Failed to complete registration.');
      }
    } catch {
      setError('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  // 1. SPLASH SCREEN
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
            <Radio className="w-12 h-12 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400/30 animate-ping" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SoundPay Pro
        </h1>
        <p className="text-sm font-semibold text-emerald-400 mt-1">
          Smart Payment Speaker & Verified Voice Assistant
        </p>

        <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
          Instant Hindi and English audio announcements for every confirmed payment. Zero fake screenshots, 100% verified gateway settlement.
        </p>

        <div className="mt-8 space-y-3 w-full">
          <button
            onClick={() => onNavigate('login')}
            className="w-full min-h-[48px] py-3 px-5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>Merchant Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="w-full min-h-[48px] py-3 px-5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
          >
            Register New Store
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Legitimate Gateway APIs & Server HMAC Verification</span>
        </div>
      </div>
    );
  }

  // 2. LOGIN SCREEN
  if (currentScreen === 'login') {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('splash')}
            className="text-xs text-slate-400 hover:text-white transition-colors mb-3 flex items-center gap-1"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Merchant Login
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your mobile number to receive a secure login OTP
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-sm font-mono text-white placeholder-slate-600 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sandbox hint: You can test with <code>9876543210</code>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Sending OTP...' : 'Get OTP Code'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Don&apos;t have an account? <strong className="text-emerald-400">Register</strong>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. OTP VERIFICATION SCREEN
  if (currentScreen === 'otp') {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-slate-400 hover:text-white transition-colors mb-3 flex items-center gap-1"
          >
            &larr; Change Mobile Number
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verify OTP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sent to <strong className="text-slate-200">+91 {mobile}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={() => setOtp('123456')}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Auto-fill (123456)
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-center tracking-widest text-xl font-bold font-mono rounded-xl px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span>Resend OTP in:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {timer > 0 ? `00:${timer < 10 ? '0' : ''}${timer}` : 'Ready'}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify & Enter Soundbox'}</span>
            <Check className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // 4. SIGNUP SCREEN
  return (
    <div className="min-h-[75vh] flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('login')}
          className="text-xs text-slate-400 hover:text-white transition-colors mb-3 flex items-center gap-1"
        >
          &larr; Already have an account? Sign In
        </button>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Register Merchant Store
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Set up your business identity to begin receiving voice announcements
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Owner Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anurag Gajbhiye"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Store / Business Name
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Smart Kirana & General Store"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-11 pr-3.5 py-2.5 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="merchant@example.com"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Merchant Category
          </label>
          <select
            value={merchantCategory}
            onChange={(e) => setMerchantCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="Retail & Grocery">Retail & Grocery</option>
            <option value="Restaurant & Cafe">Restaurant & Cafe</option>
            <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
            <option value="Freelancer / Consultant">Freelancer / Consultant</option>
            <option value="Electronics & Hardware">Electronics & Hardware</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
