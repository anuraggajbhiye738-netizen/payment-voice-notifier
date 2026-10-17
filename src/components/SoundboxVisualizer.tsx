import React from 'react';
import { Volume2, VolumeX, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { UserSettings, Transaction } from '../types';

interface SoundboxVisualizerProps {
  isSpeaking: boolean;
  settings: UserSettings;
  latestTransaction?: Transaction;
  onToggleMute: () => void;
  onTestChime: () => void;
  onOpenSimulator: () => void;
}

export const SoundboxVisualizer: React.FC<SoundboxVisualizerProps> = ({
  isSpeaking,
  settings,
  latestTransaction,
  onToggleMute,
  onTestChime,
  onOpenSimulator,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0D1524] to-[#0A101D] border border-slate-800/80 p-5 shadow-xl">
      {/* Background ambient glow when speaking */}
      {isSpeaking && (
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Top zone: Status badge and controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.voiceEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            {settings.voiceEnabled && (
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
            )}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {settings.voiceEnabled ? 'Smart Speaker Active' : 'Speaker Muted'}
          </span>
          <span className="text-slate-600 text-xs" aria-hidden="true">·</span>
          <span className="text-xs text-slate-400 capitalize">
            {settings.language === 'hi' ? 'Hindi (हिंदी)' : settings.language === 'hinglish' ? 'Hinglish' : 'English'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onTestChime}
            title="Test Soundbox Bell"
            className="min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-700/50 transition-colors flex items-center gap-1"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chime</span>
          </button>

          <button
            onClick={onToggleMute}
            title={settings.voiceEnabled ? 'Mute Announcements' : 'Unmute Announcements'}
            className="min-h-[36px] min-w-[36px] p-2 text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-700/50 transition-colors flex items-center justify-center"
          >
            {settings.voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>
        </div>
      </div>

      {/* Center audio wave visualizer */}
      <div className="flex flex-col items-center justify-center py-3 my-1">
        <div className="flex items-center gap-1.5 h-12">
          <div
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-emerald-400 animate-soundwave-1'
                : 'h-2 bg-slate-700'
            }`}
          />
          <div
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-emerald-400 animate-soundwave-2'
                : 'h-3 bg-slate-700'
            }`}
          />
          <div
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-emerald-400 animate-soundwave-3'
                : 'h-5 bg-slate-700'
            }`}
          />
          <div
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-emerald-400 animate-soundwave-4'
                : 'h-3 bg-slate-700'
            }`}
          />
          <div
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isSpeaking
                ? 'bg-emerald-400 animate-soundwave-5'
                : 'h-2 bg-slate-700'
            }`}
          />
        </div>

        <p className="mt-2 text-xs font-medium text-slate-400 text-center">
          {isSpeaking ? (
            <span className="text-emerald-400 font-semibold animate-pulse">
              Broadcasting payment notification...
            </span>
          ) : latestTransaction ? (
            <span>
              Last: <strong className="text-white">₹{latestTransaction.amount}</strong> from{' '}
              <strong className="text-white">{latestTransaction.senderName || 'Anonymous Customer'}</strong>
            </span>
          ) : (
            'Ready to announce incoming payments'
          )}
        </p>
      </div>

      {/* Bottom quick trigger strip */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Anti-Fraud: <span className="text-emerald-400 font-mono">HMAC-SHA256 Verified</span></span>
        </div>
        <button
          onClick={onOpenSimulator}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate ₹500</span>
        </button>
      </div>
    </div>
  );
};
