import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScreen, User, Transaction, UserSettings, TransactionStats } from './types';
import { api } from './services/api';
import { audioEngine } from './services/audioEngine';

// Components & Views
import { TopNav } from './components/TopNav';
import { BottomTabs } from './components/BottomTabs';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { TestPaymentSimulatorModal } from './components/TestPaymentSimulatorModal';
import { GeminiBriefingModal } from './components/GeminiBriefingModal';

import { DashboardView } from './views/DashboardView';
import { SoundboxKioskView } from './views/SoundboxKioskView';
import { HistoryView } from './views/HistoryView';
import { ConnectGatewayView } from './views/ConnectGatewayView';
import { VoiceSettingsView } from './views/VoiceSettingsView';
import { NotificationSettingsView } from './views/NotificationSettingsView';
import { ProfileView } from './views/ProfileView';
import { SecurityView } from './views/SecurityView';
import { HelpSupportView } from './views/HelpSupportView';
import { AuthViews } from './views/AuthViews';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    todayAmount: 5150,
    todayCount: 5,
    successfulCount: 5,
    pendingCount: 0,
    availableBalance: 5150,
    averageTicketSize: 1030,
  });
  const [settings, setSettings] = useState<UserSettings>({
    userId: 'usr_merchant_9821',
    language: 'hi',
    voiceGender: 'female',
    voiceEnabled: true,
    volume: 0.9,
    speechRate: 0.95,
    chimeEnabled: true,
    repeatAnnouncement: false,
    announcementTemplate: '{sender} ki taraf se aapko {amount} rupaye prapt hue hain.',
    webhookSecret: 'whsec_sndpay_live_839201948201',
    connectedGateway: 'simulator',
    gatewayApiKey: 'rzp_live_k82910482910',
    notificationsEnabled: true,
    soundboxModeEnabled: true,
    darkMode: true,
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to audio engine speaker status
  useEffect(() => {
    const unsubscribe = audioEngine.subscribeState((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  // Fetch initial state
  const loadData = useCallback(async () => {
    try {
      const [meRes, txnsRes, statsRes, settingsRes] = await Promise.all([
        api.getMe(),
        api.getTransactions(),
        api.getStats(),
        api.getSettings(),
      ]);

      if (meRes.user) {
        setUser(meRes.user);
      }
      if (txnsRes.transactions) {
        setTransactions(txnsRes.transactions);
      }
      if (statsRes) {
        setStats(statsRes);
      }
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Announce payment aloud
  const announcePayment = useCallback(
    async (txn: Transaction) => {
      if (!settings.voiceEnabled) return;

      const text = audioEngine.formatAnnouncementText(
        txn.amount,
        txn.senderName,
        settings.language,
        settings.announcementTemplate
      );

      // Trigger Web Speech API announcement with authentic chime bell
      await audioEngine.speakText(text, {
        language: settings.language,
        voiceGender: settings.voiceGender,
        volume: settings.volume,
        rate: settings.speechRate,
        repeat: settings.repeatAnnouncement,
        playChimeBefore: settings.chimeEnabled,
      });

      // Mark transaction announced on server
      api.markAnnounced(txn.id);
    },
    [settings]
  );

  // Handle incoming or simulated payment
  const handlePaymentSuccess = useCallback(
    (newTxn: Transaction) => {
      setTransactions((prev) => [newTxn, ...prev]);

      // Update today's statistics
      setStats((prev) => ({
        ...prev,
        todayAmount: prev.todayAmount + newTxn.amount,
        todayCount: prev.todayCount + 1,
        successfulCount: prev.successfulCount + 1,
        availableBalance: prev.availableBalance + newTxn.amount,
        averageTicketSize: Math.round((prev.todayAmount + newTxn.amount) / (prev.todayCount + 1)),
      }));

      // Trigger visual notification card if browser permission allows
      if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Payment Received', {
          body: `₹${newTxn.amount} received from ${newTxn.senderName || 'Customer'}`,
        });
      }

      // Automatically announce payment aloud
      announcePayment(newTxn);
    },
    [settings, announcePayment]
  );

  // Mute / Unmute Soundbox
  const handleToggleMute = async () => {
    const updated = !settings.voiceEnabled;
    const newSettings = { ...settings, voiceEnabled: updated };
    setSettings(newSettings);
    if (!updated) {
      audioEngine.stop();
    }
    await api.updateSettings({ voiceEnabled: updated });
  };

  // Test chime sound
  const handleTestChime = () => {
    audioEngine.playChime(settings.volume);
  };

  // Simulate payment shortcut
  const handleQuickSimulate = async (amount: number, senderName?: string) => {
    try {
      const res = await api.simulatePayment({
        amount,
        senderName,
        paymentMethod: 'UPI',
        gateway: 'simulator',
      });
      if (res.success && res.transaction) {
        handlePaymentSuccess(res.transaction);
      }
    } catch (err) {
      console.error('Quick simulation failed:', err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setCurrentScreen('splash');
  };

  // Account deleted handler
  const handleAccountDeleted = () => {
    setUser(null);
    setTransactions([]);
    setStats({
      todayAmount: 0,
      todayCount: 0,
      successfulCount: 0,
      pendingCount: 0,
      availableBalance: 0,
      averageTicketSize: 0,
    });
    setCurrentScreen('splash');
  };

  const isAuthScreen =
    currentScreen === 'splash' ||
    currentScreen === 'login' ||
    currentScreen === 'signup' ||
    currentScreen === 'otp';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Initializing SoundPay Pro Soundbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar (Hidden on Auth splash/login/signup screens) */}
      {!isAuthScreen && (
        <TopNav
          currentScreen={currentScreen}
          user={user}
          onNavigate={setCurrentScreen}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {isAuthScreen ? (
          <AuthViews
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onAuthSuccess={(loggedUser) => {
              setUser(loggedUser);
              loadData();
            }}
          />
        ) : (
          <>
            {currentScreen === 'dashboard' && (
              <DashboardView
                user={user}
                stats={stats}
                settings={settings}
                recentTransactions={transactions}
                isSpeaking={isSpeaking}
                onNavigate={setCurrentScreen}
                onSelectTransaction={setSelectedTransaction}
                onReplayAudio={announcePayment}
                onToggleMute={handleToggleMute}
                onTestChime={handleTestChime}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onOpenBriefing={() => setIsBriefingOpen(true)}
              />
            )}

            {currentScreen === 'soundbox_kiosk' && (
              <SoundboxKioskView
                user={user}
                settings={settings}
                latestTransaction={transactions[0]}
                isSpeaking={isSpeaking}
                onBack={() => setCurrentScreen('dashboard')}
                onToggleMute={handleToggleMute}
                onTestChime={handleTestChime}
                onSimulateAmount={handleQuickSimulate}
                onReplayLatest={() => {
                  if (transactions[0]) announcePayment(transactions[0]);
                }}
              />
            )}

            {currentScreen === 'history' && (
              <HistoryView
                transactions={transactions}
                onSelectTransaction={setSelectedTransaction}
                onReplayAudio={announcePayment}
                onOpenBriefing={() => setIsBriefingOpen(true)}
                onRefresh={loadData}
              />
            )}

            {currentScreen === 'connect_gateway' && (
              <ConnectGatewayView
                settings={settings}
                onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
              />
            )}

            {currentScreen === 'voice_settings' && (
              <VoiceSettingsView
                settings={settings}
                onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
              />
            )}

            {currentScreen === 'notification_settings' && (
              <NotificationSettingsView
                settings={settings}
                onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileView
                user={user}
                onUpdateUser={setUser}
                onNavigate={setCurrentScreen}
                onLogout={handleLogout}
              />
            )}

            {currentScreen === 'security' && (
              <SecurityView
                onLogout={handleLogout}
                onAccountDeleted={handleAccountDeleted}
              />
            )}

            {currentScreen === 'help_support' && (
              <HelpSupportView />
            )}
          </>
        )}
      </main>

      {/* Android Mobile Bottom Tab Navigation */}
      {!isAuthScreen && currentScreen !== 'soundbox_kiosk' && (
        <BottomTabs currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}

      {/* Transaction Detail Receipt Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onAnnounce={announcePayment}
      />

      {/* Payment Gateway Sandbox Simulator Modal */}
      <TestPaymentSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Gemini AI Daily Financial Briefing Modal */}
      <GeminiBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />
    </div>
  );
}
