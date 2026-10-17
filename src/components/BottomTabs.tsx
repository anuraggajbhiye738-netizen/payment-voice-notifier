import React from 'react';
import { LayoutDashboard, Radio, History, Settings, User } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomTabsProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: 'dashboard' as ActiveScreen, label: 'Home', icon: LayoutDashboard },
    { id: 'soundbox_kiosk' as ActiveScreen, label: 'Soundbox', icon: Radio },
    { id: 'history' as ActiveScreen, label: 'History', icon: History },
    { id: 'voice_settings' as ActiveScreen, label: 'Voice', icon: Settings },
    { id: 'profile' as ActiveScreen, label: 'Account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800/80 px-2 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
