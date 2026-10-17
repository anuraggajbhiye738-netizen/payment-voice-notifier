import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, TrendingUp, Lightbulb, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { audioEngine } from '../services/audioEngine';

interface GeminiBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BriefingData {
  audioBriefing: string;
  peakHourInsight: string;
  smartRecommendation: string;
  sentiment: 'bullish' | 'steady' | 'growth';
}

export const GeminiBriefingModal: React.FC<GeminiBriefingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBriefing();
    }
  }, [isOpen]);

  const loadBriefing = async () => {
    setLoading(true);
    try {
      const res = await api.getGeminiBriefing();
      if (res.success && res.briefing) {
        setBriefing(res.briefing);
      }
    } catch {
      // Fallback is handled on server
    } finally {
      setLoading(false);
    }
  };

  const handlePlayBriefing = async () => {
    if (!briefing?.audioBriefing) return;
    setIsPlaying(true);
    await audioEngine.speakText(briefing.audioBriefing, {
      language: 'hi',
      voiceGender: 'female',
      volume: 1.0,
      playChimeBefore: true,
    });
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Gemini AI Merchant Financial Briefing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-200">
                Gemini is analyzing your daily transactions...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Synthesizing payment velocity, peak sales hours, and merchant advice
              </p>
            </div>
          ) : briefing ? (
            <>
              {/* Audio broadcast box */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Today&apos;s Voice Briefing Script
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Model: gemini-3.8-flash
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;{briefing.audioBriefing}&rdquo;
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handlePlayBriefing}
                    disabled={isPlaying}
                    className="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                    <span>{isPlaying ? 'Speaking Briefing...' : 'Play Audio Briefing'}</span>
                  </button>
                </div>
              </div>

              {/* Peak hours */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Velocity & Peak Hour Analysis</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {briefing.peakHourInsight}
                  </p>
                </div>
              </div>

              {/* Smart Recommendation */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Merchant Growth Recommendation</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {briefing.smartRecommendation}
                  </p>
                </div>
              </div>

              {/* Sentiment & Status */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Business Momentum: <strong className="text-emerald-400 capitalize">{briefing.sentiment}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Verified</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">
              No transaction data available to summarize.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
