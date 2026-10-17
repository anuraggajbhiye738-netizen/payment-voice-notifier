import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Check, Sliders, MessageSquare, Bell } from 'lucide-react';
import { UserSettings, AnnouncementLanguage, VoiceGender } from '../types';
import { api } from '../services/api';
import { audioEngine } from '../services/audioEngine';

interface VoiceSettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const VoiceSettingsView: React.FC<VoiceSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [language, setLanguage] = useState<AnnouncementLanguage>(settings.language);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(settings.voiceGender);
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [volume, setVolume] = useState(settings.volume);
  const [speechRate, setSpeechRate] = useState(settings.speechRate || 0.95);
  const [chimeEnabled, setChimeEnabled] = useState(settings.chimeEnabled);
  const [repeatAnnouncement, setRepeatAnnouncement] = useState(settings.repeatAnnouncement);
  const [template, setTemplate] = useState(settings.announcementTemplate);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleTestVoice = async () => {
    setIsPlayingTest(true);
    const sampleText = audioEngine.formatAnnouncementText(500, 'Rahul', language, template);
    await audioEngine.speakText(sampleText, {
      language,
      voiceGender,
      volume,
      rate: speechRate,
      repeat: repeatAnnouncement,
      playChimeBefore: chimeEnabled,
    });
    setIsPlayingTest(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.updateSettings({
        language,
        voiceGender,
        voiceEnabled,
        volume,
        speechRate,
        chimeEnabled,
        repeatAnnouncement,
        announcementTemplate: template,
      });

      if (res.success) {
        onUpdateSettings(res.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Soundbox Voice & Audio Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize the speech synthesis language, chime bell, and broadcast volume
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Master Switch Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">
              Voice Announcements
            </h3>
            <p className="text-xs text-slate-400">
              Speak incoming payments aloud as soon as verified by backend
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Language Selection */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3.5">
          <h3 className="text-sm font-bold text-slate-200">
            Announcement Language
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'hi', label: 'Hindi (हिंदी)', sample: 'Rahul ki taraf se 500 rupaye prapt hue hain.' },
              { id: 'hinglish', label: 'Hinglish', sample: 'Aapko ₹500 Rahul ki taraf se aaye hain.' },
              { id: 'en', label: 'English', sample: 'Received 500 Rupees from Rahul.' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id as AnnouncementLanguage)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  language === l.id
                    ? 'border-emerald-500 bg-emerald-950/20 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">{l.label}</span>
                  {language === l.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 italic">&ldquo;{l.sample}&rdquo;</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Gender & Speech Rate */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            Voice Persona & Pitch
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVoiceGender('female')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                voiceGender === 'female'
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <span>Female Voice</span>
              {voiceGender === 'female' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setVoiceGender('male')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                voiceGender === 'male'
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <span>Male Voice</span>
              {voiceGender === 'male' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Volume slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Broadcast Volume</span>
              <span className="text-emerald-400 font-mono font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Speech Rate slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Speech Speed</span>
              <span className="text-emerald-400 font-mono font-bold">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Chime and Repeat options */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">Soundbox Chime Bell</h4>
              </div>
              <p className="text-[11px] text-slate-400">Play two-tone metallic chime before speaking</p>
            </div>
            <input
              type="checkbox"
              checked={chimeEnabled}
              onChange={(e) => setChimeEnabled(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-200">Repeat Announcement</h4>
              <p className="text-[11px] text-slate-400">Announce payment twice for crowded/noisy shops</p>
            </div>
            <input
              type="checkbox"
              checked={repeatAnnouncement}
              onChange={(e) => setRepeatAnnouncement(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4"
            />
          </div>
        </div>

        {/* Custom Template Card */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200">Custom Announcement Template</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Use variables <code>&#123;amount&#125;</code> and <code>&#123;sender&#125;</code>. If sender name is withheld by the bank, <code>&#123;sender&#125;</code> will be omitted safely.
          </p>
          <input
            type="text"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
          />
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Voice settings successfully saved and applied.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isPlayingTest}
            className="min-h-[48px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Play className={`w-4 h-4 text-emerald-400 ${isPlayingTest ? 'animate-pulse' : ''}`} />
            <span>{isPlayingTest ? 'Playing Test...' : 'Test Voice Output'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 min-h-[48px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            {saving ? 'Saving...' : 'Save Voice Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
