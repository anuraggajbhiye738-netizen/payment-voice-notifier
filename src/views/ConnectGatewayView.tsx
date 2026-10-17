import React, { useState } from 'react';
import { Radio, ShieldCheck, Copy, Check, Lock, AlertTriangle, Key, Globe, RefreshCw } from 'lucide-react';
import { UserSettings } from '../types';
import { api } from '../services/api';

interface ConnectGatewayViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const ConnectGatewayView: React.FC<ConnectGatewayViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [gateway, setGateway] = useState(settings.connectedGateway || 'simulator');
  const [apiKey, setApiKey] = useState(settings.gatewayApiKey || '');
  const [webhookSecret, setWebhookSecret] = useState(settings.webhookSecret);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const webhookEndpoint = `${window.location.origin}/api/webhooks/payment`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleRotateSecret = () => {
    const newSec = 'whsec_sndpay_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setWebhookSecret(newSec);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateSettings({
        connectedGateway: gateway as 'razorpay' | 'cashfree' | 'stripe' | 'simulator',
        gatewayApiKey: apiKey.trim(),
        webhookSecret: webhookSecret.trim(),
      });

      if (res.success) {
        onUpdateSettings(res.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Payment Gateway & Webhook Integration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Receive real-time, verified payment announcements directly from your payment provider
        </p>
      </div>

      {/* Anti-Scraping Compliance Notice */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-emerald-300">
            Compliant Payment Provider Architecture
          </p>
          <p className="text-emerald-400/80 leading-relaxed">
            SoundPay Pro connects exclusively via legitimate server-to-server payment gateway webhooks. It never attempts to read private banking data, intercept other apps, or scrape SMS.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Select Provider */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            1. Select Supported Payment Gateway
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'simulator', name: 'Sandbox Simulator', desc: 'Pre-configured test gateway with live UPI simulator' },
              { id: 'razorpay', name: 'Razorpay Live / Test', desc: 'Standard Indian UPI, Cards & Netbanking webhooks' },
              { id: 'cashfree', name: 'Cashfree Payments', desc: 'Auto-collect UPI QR & payment gateway webhooks' },
            ].map((p) => (
              <label
                key={p.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  gateway === p.id
                    ? 'border-emerald-500 bg-emerald-950/20 text-white'
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs">{p.name}</span>
                  <input
                    type="radio"
                    name="gateway"
                    value={p.id}
                    checked={gateway === p.id}
                    onChange={(e) => setGateway(e.target.value as typeof gateway)}
                    className="text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{p.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Webhook Configuration Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            2. Webhook Setup (Server-to-Server)
          </h3>
          <p className="text-xs text-slate-400">
            Copy this endpoint into your Razorpay or Cashfree Dashboard under <strong>Settings &gt; Webhooks</strong>. Enable the <code>payment.captured</code> event.
          </p>

          {/* Webhook URL field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Your SoundPay Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  readOnly
                  value={webhookEndpoint}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-emerald-400 outline-none select-all"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="min-h-[42px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Webhook Signing Secret (HMAC-SHA256)
              </label>
              <button
                type="button"
                onClick={handleRotateSecret}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rotate Secret</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-200 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopySecret}
                className="min-h-[42px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used on the backend to verify the <code>x-razorpay-signature</code> or <code>x-cashfree-signature</code> header.
            </p>
          </div>

          {/* Optional Gateway API Key */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gateway API Key ID (Optional for REST Verification)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="rzp_live_xxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Gateway settings and webhook signing secret updated successfully.</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          {saving ? 'Saving...' : 'Save Gateway Configuration'}
        </button>
      </form>
    </div>
  );
};
