import React, { useState } from 'react';
import { Search, Download, Filter, Sparkles, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';
import { TransactionCard } from '../components/TransactionCard';

interface HistoryViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  onReplayAudio: (txn: Transaction) => void;
  onOpenBriefing: () => void;
  onRefresh: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onSelectTransaction,
  onReplayAudio,
  onOpenBriefing,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');

  // Filter transactions
  const filtered = transactions.filter((txn) => {
    // Status
    if (statusFilter !== 'ALL' && txn.status !== statusFilter) return false;

    // Date
    const now = Date.now();
    const txnTime = new Date(txn.timestamp).getTime();
    if (dateFilter === 'TODAY') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      if (txnTime < startOfDay.getTime()) return false;
    } else if (dateFilter === 'WEEK') {
      if (now - txnTime > 7 * 24 * 3600 * 1000) return false;
    } else if (dateFilter === 'MONTH') {
      if (now - txnTime > 30 * 24 * 3600 * 1000) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSender = txn.senderName && txn.senderName.toLowerCase().includes(q);
      const matchId = txn.providerTransactionId.toLowerCase().includes(q);
      const matchVpa = txn.senderVpa && txn.senderVpa.toLowerCase().includes(q);
      const matchAmt = txn.amount.toString().includes(q);
      if (!matchSender && !matchId && !matchVpa && !matchAmt) return false;
    }

    return true;
  });

  const totalFilteredSum = filtered.reduce(
    (sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0),
    0
  );

  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Payer Name', 'UPI VPA', 'Amount', 'Currency', 'Status', 'Date', 'Time'];
    const rows = filtered.map((t) => {
      const d = new Date(t.timestamp);
      return [
        t.providerTransactionId,
        `"${t.senderName || 'Anonymous'}"`,
        `"${t.senderVpa || ''}"`,
        t.amount,
        t.currency,
        t.status,
        d.toLocaleDateString('en-IN'),
        d.toLocaleTimeString('en-IN'),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soundpay_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Title & Top Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of server-verified payment credits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBriefing}
            className="min-h-[40px] px-3 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 rounded-xl text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Briefing</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="min-h-[40px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-50 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh Ledger"
            className="min-h-[40px] p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by payer name, UPI ID, or Transaction ID..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Date Segmented Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setDateFilter(filterKey)}
                className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  dateFilter === filterKey
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filterKey === 'ALL'
                  ? 'All Time'
                  : filterKey === 'TODAY'
                  ? 'Today'
                  : filterKey === 'WEEK'
                  ? 'This Week'
                  : 'This Month'}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Successful Only</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Summary Strip */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filtered.length}</strong> transactions
        </span>
        <span>
          Total Filtered Revenue:{' '}
          <strong className="text-emerald-400 font-mono text-sm font-bold">
            ₹{totalFilteredSum.toLocaleString('en-IN')}
          </strong>
        </span>
      </div>

      {/* List Feed */}
      <div className="space-y-2.5">
        {filtered.map((txn) => (
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

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <p className="text-sm font-medium text-slate-300">No transactions match your filters</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting the date range or clear search keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
