import React from 'react';
import { CheckCircle2, Clock, Volume2, ShieldCheck, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
  onReplayAudio: (e: React.MouseEvent) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onClick,
  onReplayAudio,
}) => {
  const isSuccess = transaction.status === 'SUCCESS';
  const hasSender = Boolean(transaction.senderName && transaction.senderName.trim().length > 0);

  // Format date/time
  const dateObj = new Date(transaction.timestamp);
  const timeStr = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group w-full text-left bg-slate-900/70 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3"
    >
      {/* Left side: Icon + Sender + Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-100 truncate">
              {hasSender ? transaction.senderName : 'Customer (Name Unavailable)'}
            </h4>
            {transaction.signatureVerified && (
              <span title="HMAC-SHA256 Cryptographically Verified">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="font-mono text-[11px] text-slate-400">{timeStr}</span>
            <span aria-hidden="true">·</span>
            <span>{transaction.metadata?.paymentMethod || 'UPI'}</span>
            {transaction.senderVpa && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                  {transaction.senderVpa}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Amount + Audio Replay Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-base font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
            +₹{transaction.amount.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80">
            {transaction.status}
          </span>
        </div>

        <button
          onClick={onReplayAudio}
          title="Announce this payment aloud"
          className="min-h-[40px] min-w-[40px] p-2 text-slate-400 hover:text-emerald-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/40 transition-colors flex items-center justify-center"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors hidden sm:block" />
      </div>
    </div>
  );
};
