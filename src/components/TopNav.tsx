import React from 'react';
import { ActiveScreen, User } from '../types';

interface TopNavProps {
  currentScreen: ActiveScreen;
  user: User | null;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenSimulator: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  user,
  onNavigate,
  onOpenSimulator,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-base">
            ₹
          </span>
          <span>SoundPay Pro</span>
        </button>

        {/* Zone 2: 4-5 clean single-line navigation links (desktop/tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentScreen === 'dashboard' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('soundbox_kiosk')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentScreen === 'soundbox_kiosk' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Soundbox Kiosk
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentScreen === 'history' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => onNavigate('connect_gateway')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentScreen === 'connect_gateway' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Gateway Webhooks
          </button>
          <button
            onClick={() => onNavigate('voice_settings')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors py-1 ${
              currentScreen === 'voice_settings' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Voice Settings
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="min-h-[40px] px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-500/15 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>+ Test Payment</span>
          </button>

          {user && (
            <button
              onClick={() => onNavigate('profile')}
              title="Merchant Profile"
              className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-bold flex items-center justify-center transition-colors"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
