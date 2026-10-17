import React, { useState } from 'react';
import { Bell, Check, Smartphone, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import { UserSettings } from '../types';
import { api } from '../services/api';

interface NotificationSettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTestNotification = () => {
    // Check if browser notifications are supported
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Payment Received', {
          body: '₹500 received from Rahul Sharma',
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Payment Received', {
              body: '₹500 received from Rahul Sharma',
            });
          }
        });
      }
    }

    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings({
        notificationsEnabled,
      });
      if (res.success) {
        onUpdateSettings(res.settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Notification & Alert Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure visual push banners and background phone alerts for confirmed credits
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Push Notification Switch */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">
              Push Notifications
            </h3>
            <p className="text-xs text-slate-400">
              Receive on-screen notification cards when money is received
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Example Notification Preview */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-300">
            Live Android Notification Preview
          </h4>

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                ₹
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>SoundPay Pro</span>
                  <span className="text-[10px] text-slate-500 font-normal">now</span>
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  Payment Received: <strong className="text-emerald-400">₹500</strong> from Rahul
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              VERIFIED
            </span>
          </div>

          <button
            type="button"
            onClick={handleTestNotification}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 pt-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Test Push Notification</span>
          </button>
          {testNotificationSent && (
            <p className="text-xs text-emerald-400">Sample notification dispatched.</p>
          )}
        </div>

        {/* Alert Modalities */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">System Notification Sound</h4>
              <p className="text-[11px] text-slate-400">Play default Android notification chime on arrival</p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Device Vibration</h4>
              <p className="text-[11px] text-slate-400">Haptic vibration pulse when a payment is confirmed</p>
            </div>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4"
            />
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Notification preferences updated.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </form>
    </div>
  );
};
