import React from 'react';
import { Volume2, VolumeX, ArrowLeft, Radio, Sparkles, ShieldCheck } from 'lucide-react';
import { Transaction, UserSettings, User } from '../types';

interface SoundboxKioskViewProps {
  user: User | null;
  settings: UserSettings;
  latestTransaction?: Transaction;
  isSpeaking: boolean;
  onBack: () => void;
  onToggleMute: () => void;
  onTestChime: () => void;
  onSimulateAmount: (amount: number, senderName?: string) => void;
  onReplayLatest: () => void;
}

export const SoundboxKioskView: React.FC<SoundboxKioskViewProps> = ({
  user,
  settings,
  latestTransaction,
  isSpeaking,
  onBack,
  onToggleMute,
  onTestChime,
  onSimulateAmount,
  onReplayLatest,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-4 pb-20 md:pb-6 space-y-6">
      {/* Top Bar for Kiosk */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={onBack}
          className="min-h-[44px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Kiosk</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            LIVE MERCHANT SPEAKER MODE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTestChime}
            className="min-h-[44px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Bell</span>
          </button>
          <button
            onClick={onToggleMute}
            className="min-h-[44px] p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            {settings.voiceEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-rose-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Kiosk Center Stage */}
      <div className="text-center flex-1 flex flex-col items-center justify-center py-6 px-4">
        {/* Pulsing Speaker Cone Graphics */}
        <div className="relative mb-8">
          <div
            className={`w-40 h-40 sm:w-52 sm:h-52 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              isSpeaking
                ? 'border-emerald-400/80 bg-emerald-500/10 scale-105 shadow-2xl shadow-emerald-500/20'
                : 'border-slate-800 bg-slate-950/60'
            }`}
          >
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border flex items-center justify-center transition-all ${
                isSpeaking
                  ? 'border-emerald-400/60 bg-emerald-500/15 animate-pulse'
                  : 'border-slate-800/80 bg-slate-900/80'
              }`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
                  isSpeaking ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-emerald-400'
                }`}
              >
                <Radio className={`w-8 h-8 ${isSpeaking ? 'animate-bounce' : ''}`} />
              </div>
            </div>
          </div>

          {/* Sound waves radiating */}
          {isSpeaking && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
              <span className="absolute -inset-4 rounded-full border border-emerald-400/20 animate-pulse pointer-events-none" />
            </>
          )}
        </div>

        {/* Big Display for Payment Received */}
        {latestTransaction ? (
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400 font-mono">
              VERIFIED PAYMENT ANNOUNCEMENT
            </span>

            <div className="text-5xl sm:text-7xl font-black font-mono tabular-nums text-white tracking-tight">
              ₹{latestTransaction.amount.toLocaleString('en-IN')}
            </div>

            <div className="text-lg sm:text-xl font-medium text-slate-200">
              {latestTransaction.senderName ? (
                <>
                  from <span className="font-bold text-white underline decoration-emerald-400/50">{latestTransaction.senderName}</span>
                </>
              ) : (
                <span className="text-slate-400">Payer Anonymous (Verified)</span>
              )}
            </div>

            <p className="text-xs text-slate-400 italic bg-slate-900/60 py-2 px-4 rounded-xl border border-slate-800 inline-block">
              &ldquo;
              {latestTransaction.senderName
                ? `${latestTransaction.senderName} ki taraf se aapko ${latestTransaction.amount} rupaye prapt hue hain.`
                : `Aapko ${latestTransaction.amount} rupaye prapt hue hain.`}
              &rdquo;
            </p>

            <div className="pt-2">
              <button
                onClick={onReplayLatest}
                className="min-h-[44px] px-5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Repeat Voice Announcement</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 space-y-2">
            <h2 className="text-2xl font-bold text-slate-200">Waiting for payments...</h2>
            <p className="text-xs max-w-sm">
              Keep this screen active on your shop counter. Incoming payments will ring and announce instantly.
            </p>
          </div>
        )}
      </div>

      {/* Quick Merchant Counter Test Triggers */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Counter Test Buttons (Instant Voice):</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Fraud Active</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onSimulateAmount(100, 'Rahul')}
            className="min-h-[48px] py-2 px-3 bg-slate-950 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">₹100</p>
            <p className="text-[10px] text-slate-400 truncate">from Rahul</p>
          </button>

          <button
            onClick={() => onSimulateAmount(500, 'Rahul')}
            className="min-h-[48px] py-2 px-3 bg-slate-950 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">₹500</p>
            <p className="text-[10px] text-slate-400 truncate">from Rahul</p>
          </button>

          <button
            onClick={() => onSimulateAmount(1500, 'Priya')}
            className="min-h-[48px] py-2 px-3 bg-slate-950 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
          >
            <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">₹1,500</p>
            <p className="text-[10px] text-slate-400 truncate">from Priya</p>
          </button>
        </div>
      </div>
    </div>
  );
};
