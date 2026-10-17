import React from 'react';
import { Sparkles, Radio, ArrowUpRight, ShieldCheck, History, Sliders, ChevronRight } from 'lucide-react';
import { Transaction, TransactionStats, UserSettings, User, ActiveScreen } from '../types';
import { SoundboxVisualizer } from '../components/SoundboxVisualizer';
import { TransactionCard } from '../components/TransactionCard';

interface DashboardViewProps {
  user: User | null;
  stats: TransactionStats;
  settings: UserSettings;
  recentTransactions: Transaction[];
  isSpeaking: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectTransaction: (txn: Transaction) => void;
  onReplayAudio: (txn: Transaction) => void;
  onToggleMute: () => void;
  onTestChime: () => void;
  onOpenSimulator: () => void;
  onOpenBriefing: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  stats,
  settings,
  recentTransactions,
  isSpeaking,
  onNavigate,
  onSelectTransaction,
  onReplayAudio,
  onToggleMute,
  onTestChime,
  onOpenSimulator,
  onOpenBriefing,
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Merchant Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {user?.businessName || 'Merchant Soundbox'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.name || 'Authorized Merchant'} <span aria-hidden="true">·</span>{' '}
            <span className="text-emerald-400 font-medium">Gateway Live</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBriefing}
            className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Daily Briefing</span>
          </button>

          <button
            onClick={() => onNavigate('soundbox_kiosk')}
            className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Kiosk Mode</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-xs font-medium text-slate-400">Today&apos;s Collection</span>
          <h3 className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            ₹{stats.todayAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{stats.todayCount} Payments Today</span>
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-xs font-medium text-slate-400">Available Balance</span>
          <h3 className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            ₹{stats.availableBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Settled to Bank Account
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-xs font-medium text-slate-400">Average Ticket</span>
          <h3 className="text-2xl font-bold font-mono tabular-nums text-slate-100 mt-1">
            ₹{stats.averageTicketSize.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Per Verified Transaction
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-xs font-medium text-slate-400">Anti-Fraud Engine</span>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">100% Verified</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero Unverified Audio
          </p>
        </div>
      </div>

      {/* Soundbox Visualizer Widget */}
      <SoundboxVisualizer
        isSpeaking={isSpeaking}
        settings={settings}
        latestTransaction={recentTransactions[0]}
        onToggleMute={onToggleMute}
        onTestChime={onTestChime}
        onOpenSimulator={onOpenSimulator}
      />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenSimulator}
          className="p-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-xl text-left transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-200">Simulate Payment</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Test Rahul / Priya payments</p>
        </button>

        <button
          onClick={() => onNavigate('connect_gateway')}
          className="p-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-xl text-left transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-200">Payment Gateway</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Razorpay & Webhooks</p>
        </button>

        <button
          onClick={() => onNavigate('voice_settings')}
          className="p-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-xl text-left transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-200">Voice Settings</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Hindi / English / Voice speed</p>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="p-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-xl text-left transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <History className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-slate-200">All Transactions</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Filter & Export CSV</p>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recent Confirmed Payments
            </h3>
            <span className="text-xs text-slate-500">
              ({recentTransactions.length} items)
            </span>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.slice(0, 5).map((txn) => (
            <TransactionCard
              key={txn.id}
              transaction={txn}
              onClick={() => onSelectTransaction(txn)}
              onReplayAudio={(e) => {
                e.stopPropagation();
                onReplayAudio(txn);
              }}
            />
          ))}

          {recentTransactions.length === 0 && (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60">
              <p className="text-sm text-slate-400">No transactions recorded yet.</p>
              <button
                onClick={onOpenSimulator}
                className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors"
              >
                Simulate First Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
