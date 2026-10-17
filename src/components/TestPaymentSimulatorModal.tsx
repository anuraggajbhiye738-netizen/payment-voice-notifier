import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface TestPaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (txn: Transaction) => void;
}

export const TestPaymentSimulatorModal: React.FC<TestPaymentSimulatorModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [senderName, setSenderName] = useState('Rahul Sharma');
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [gateway, setGateway] = useState('simulator');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    { label: '₹500 from Rahul', name: 'Rahul Sharma', amt: '500', anon: false },
    { label: '₹1,500 from Priya', name: 'Priya Verma', amt: '1500', anon: false },
    { label: '₹100 from Rahul', name: 'Rahul', amt: '100', anon: false },
    { label: '₹350 (Anonymous Payer)', name: '', amt: '350', anon: true },
  ];

  const handleApplyPreset = (preset: typeof quickPresets[0]) => {
    setSenderName(preset.name);
    setAmount(preset.amt);
    setIsAnonymous(preset.anon);
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('Please enter a valid amount.');
      }

      const res = await api.simulatePayment({
        senderName: isAnonymous ? undefined : senderName.trim(),
        amount: parsed,
        paymentMethod,
        gateway,
      });

      if (res.success && res.transaction) {
        onPaymentSuccess(res.transaction);
        onClose();
      } else {
        throw new Error(res.message || 'Payment simulation failed.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to trigger simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Payment Gateway Sandbox Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSimulate} className="p-6 overflow-y-auto space-y-5">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographic Anti-Fraud Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This simulates an authentic webhook arriving from UPI or your payment gateway with full HMAC-SHA256 signature verification before the voice announcement fires.
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Quick Test Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-2 text-left text-xs font-medium rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-8 pr-4 py-2.5 text-base font-bold font-mono text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Sender / Payer Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Payer / Sender Name
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span>Simulate name unavailable</span>
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? '' : senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-950 border border-slate-800 disabled:opacity-50 disabled:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
              <UserCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            {isAnonymous && (
              <p className="mt-1 text-[11px] text-slate-400">
                Anti-fraud policy: If payer name is not disclosed by bank, voice announces: <em>"Aapko {amount || '...'} rupaye prapt hue hain"</em> without guessing.
              </p>
            )}
          </div>

          {/* Gateway selector */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Gateway Pipeline</label>
              <select
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 outline-none"
              >
                <option value="simulator">Sandbox Simulator</option>
                <option value="razorpay">Razorpay Webhook</option>
                <option value="cashfree">Cashfree Webhook</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 outline-none"
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="NETBANKING">Netbanking</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying HMAC Signature...' : 'Trigger Verified Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
