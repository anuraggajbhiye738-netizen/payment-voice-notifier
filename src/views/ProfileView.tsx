import React, { useState } from 'react';
import { User as UserIcon, Store, Phone, Mail, QrCode, ShieldCheck, Check, LogOut, Trash2 } from 'lucide-react';
import { User, ActiveScreen } from '../types';
import { api } from '../services/api';

interface ProfileViewProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onLogout,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [merchantCategory, setMerchantCategory] = useState(user?.merchantCategory || 'Retail');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (user) {
        const updated = {
          ...user,
          name: name.trim(),
          businessName: businessName.trim(),
          email: email ? email.trim() : undefined,
          merchantCategory,
        };
        onUpdateUser(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      setSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Merchant Profile & Counter QR
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your registered business identity and merchant QR code
        </p>
      </div>

      {/* Profile & Counter QR Card */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code Container */}
        <div className="flex flex-col items-center shrink-0">
          <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            {/* SVG simulated crisp UPI SoundPay QR code */}
            <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
              {/* Outer boundary */}
              <rect width="100" height="100" fill="#ffffff" />
              {/* Top-left marker */}
              <rect x="8" y="8" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="13" y="13" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="18" y="18" width="8" height="8" rx="1" fill="#10b981" />

              {/* Top-right marker */}
              <rect x="64" y="8" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="69" y="13" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="74" y="18" width="8" height="8" rx="1" fill="#10b981" />

              {/* Bottom-left marker */}
              <rect x="8" y="64" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="13" y="69" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="18" y="74" width="8" height="8" rx="1" fill="#10b981" />

              {/* Data matrix dots */}
              <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="24" width="6" height="6" fill="#10b981" />
              <rect x="12" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="24" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="42" width="16" height="16" rx="2" fill="#0f172a" />
              <rect x="46" y="46" width="8" height="8" fill="#10b981" />
              <rect x="64" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="78" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="44" y="68" width="6" height="6" fill="#0f172a" />
              <rect x="54" y="78" width="6" height="6" fill="#0f172a" />
              <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
              <rect x="78" y="78" width="6" height="6" fill="#0f172a" />
              <rect x="68" y="84" width="6" height="6" fill="#10b981" />
            </svg>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold mt-2">
            UPI ID: soundpay.merchant@bank
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC & Gateway Verified</span>
          </div>

          <h2 className="text-xl font-bold text-white">
            {user?.businessName || 'Merchant Store'}
          </h2>

          <p className="text-xs text-slate-400">
            Registered: {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Display this QR code at your checkout counter. When customers pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM), SoundPay Pro will instantly verify and announce the payment.
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Business Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Merchant Owner Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Business / Store Name
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Registered Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                readOnly
                disabled
                value={user?.mobile || '+91 98765 43210'}
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile details saved.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-emerald-500/20"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('security')}
            className="text-xs font-medium text-slate-400 hover:text-white underline decoration-slate-600 transition-colors"
          >
            Security & Account Controls
          </button>
        </div>
      </form>
    </div>
  );
};
