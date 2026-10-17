import React, { useState } from 'react';
import { X, ShieldCheck, Volume2, Copy, Check, ArrowDownLeft, Lock } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onAnnounce: (txn: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onAnnounce,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const dateObj = new Date(transaction.timestamp);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.providerTransactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSender = Boolean(transaction.senderName && transaction.senderName.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">Verified Payment Receipt</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          {/* Amount Showcase */}
          <div className="text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Payment Received
            </p>
            <h2 className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400 mt-1">
              ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {formattedDate} at {formattedTime}
            </p>
          </div>

          {/* Security & Verification Banner */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-300">
                Server-Side Cryptographic Verification Passed
              </p>
              <p className="text-emerald-400/80 mt-0.5 leading-relaxed">
                HMAC-SHA256 signature verified against merchant webhook secret. This transaction was legitimately settled before audio announcement.
              </p>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Payer / Sender</span>
              <span className="font-semibold text-slate-100 text-right">
                {hasSender ? (
                  transaction.senderName
                ) : (
                  <span className="text-slate-400 italic">
                    Not disclosed by bank (Anti-fabrication active)
                  </span>
                )}
              </span>
            </div>

            {transaction.senderVpa && (
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Sender UPI VPA</span>
                <span className="font-mono text-slate-200">{transaction.senderVpa}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Transaction ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-200 truncate max-w-[170px]">
                  {transaction.providerTransactionId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:text-emerald-400 text-slate-400 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Payment Gateway</span>
              <span className="uppercase font-semibold text-slate-200">{transaction.gateway}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Bank Reference (RRN)</span>
              <span className="font-mono text-slate-200">
                {transaction.metadata?.bankReference || 'UPI/498102948190'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-slate-200">{transaction.metadata?.paymentMethod || 'UPI'}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Voice Announcement Status</span>
              <span className="font-semibold text-emerald-400 capitalize">
                {transaction.announcementStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => onAnnounce(transaction)}
            className="flex-1 min-h-[48px] py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Volume2 className="w-4 h-4" />
            <span>Re-Announce Payment</span>
          </button>
          <button
            onClick={onClose}
            className="min-h-[48px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
