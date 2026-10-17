import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, Key, LogOut, Trash2, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface SecurityViewProps {
  onLogout: () => void;
  onAccountDeleted: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ onLogout, onAccountDeleted }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError("Please type 'DELETE' in uppercase to confirm.");
      return;
    }

    setDeleting(true);
    try {
      const res = await api.deleteAccount(deleteConfirmation);
      if (res.success) {
        onAccountDeleted();
      } else {
        setDeleteError(res.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Network error while deleting account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Security & Compliance
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Enterprise-grade anti-fraud protections, session controls, and data privacy
        </p>
      </div>

      {/* Zero Financial Credential Storage Disclosure */}
      <div className="p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-300">
            Zero Financial Credential Storage Guarantee
          </h3>
        </div>
        <p className="text-xs text-emerald-400/80 leading-relaxed">
          SoundPay Pro adheres to strict RBI and digital payment guidelines. Under NO circumstances does SoundPay Pro store, request, or handle:
        </p>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li>UPI PINs or Bank Account MPINs</li>
          <li>Credit / Debit Card CVVs or Expiry Dates</li>
          <li>Internet Banking Passwords or SMS OTPs</li>
          <li>Private banking session cookies or accessibility interception</li>
        </ul>
      </div>

      {/* Security Checkpoints */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Anti-Fraud Security Architecture
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Server-Side HMAC-SHA256 Signature Verification</p>
              <p className="text-slate-400 mt-0.5">
                Every webhook from Razorpay, Cashfree, or UPI is cryptographically verified on the backend before the voice speaker announces the payment.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Strict Idempotency Mechanism</p>
              <p className="text-slate-400 mt-0.5">
                Duplicate transaction IDs are rejected by the server to prevent replay attacks and duplicate audio broadcasts.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl flex items-start gap-3">
            <Key className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Backend Secret Protection</p>
              <p className="text-slate-400 mt-0.5">
                Payment gateway API secrets and Gemini API keys are kept strictly on the Node.js server and never exposed to the client browser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Session & Account Actions
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <p className="font-medium text-slate-200">End Active Session</p>
            <p className="mt-0.5">Logs you out and requires mobile OTP verification to sign back in.</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <p className="font-medium text-rose-400">Delete Account & Purge Data</p>
            <p className="mt-0.5">Permanently deletes your merchant account and clears all transaction history.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 border border-rose-800/50 text-rose-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-800/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action is irreversible. All merchant settings, webhook secrets, and transaction history will be purged from the server ledger.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Type <strong className="text-white font-mono">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-rose-400">{deleteError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="min-h-[44px] px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || deleteConfirmation !== 'DELETE'}
                  className="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
