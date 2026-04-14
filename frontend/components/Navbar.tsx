'use client';

import { Zap, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import { AppState } from '@/types/index';

interface NavbarProps {
  state: AppState;
}

export function Navbar({ state }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-card backdrop-blur-xs">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-9 md:w-10 h-9 md:h-10 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] rounded-xl flex items-center justify-center shadow-elevated hover:shadow-hover transition-smooth transform hover:scale-105">
            <Zap className="w-5 md:w-6 h-5 md:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-[#0F1117] leading-tight">WireFluid</h1>
            <p className="text-xs text-[#5B6B7A] font-medium">Arena</p>
          </div>
        </div>

        {/* Center: Match Ticker */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-[#FAFAFA] to-white rounded-full border border-[#E5E7EB] shadow-card hover:shadow-elevated transition-smooth group flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse group-hover:scale-125 transition-smooth"></div>
            <span className="text-sm font-semibold text-[#0F1117]">KK vs MS</span>
            <span className="text-xs text-[#5B6B7A] font-medium">LIVE</span>
          </div>
          <div className="w-px h-4 bg-[#E5E7EB]"></div>
          <span className="text-xs text-[#5B6B7A] hidden md:inline">45.2 • 8/10</span>
        </div>

        {/* Right: Actions & Account */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-smooth focus-ring group hidden md:flex"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#5B6B7A] group-hover:text-[#0F1117] transition-smooth" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full animate-pulse"></span>
          </button>

          {/* Wallet Balance */}
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#FEF3C7] to-[#FEF08A] border border-[#F5A623]/30 rounded-lg hover:border-[#F5A623]/60 transition-smooth shadow-card hover:shadow-elevated group">
            <span className="text-[#F5A623] font-bold text-lg">◈</span>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xs text-[#5B6B7A] font-medium">Balance</span>
              <span className="font-bold text-[#0F1117] text-sm tabular-nums">{state.wireBalance.toLocaleString()}</span>
            </div>
            <span className="text-sm md:hidden font-bold text-[#0F1117] tabular-nums">{state.wireBalance.toLocaleString()}</span>
          </div>

          {/* Settings */}
          <button 
            className="p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-smooth focus-ring group hidden md:flex"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-[#5B6B7A] group-hover:text-[#0F1117] transition-smooth" />
          </button>

          {/* Profile Avatar */}
          <div className="w-9 md:w-10 h-9 md:h-10 bg-gradient-to-br from-[#2563EB] via-[#1E40AF] to-[#1E3A8A] rounded-full border-2 border-[#10B981] shadow-elevated flex items-center justify-center text-white text-xs md:text-sm font-bold hover:shadow-hover transition-smooth cursor-pointer transform hover:scale-110 active:scale-95">
            AC
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-[73px] right-4 md:right-8 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-hover animate-slide-down z-50">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h3 className="font-bold text-[#0F1117]">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {[
                { title: 'Match Started', desc: 'KK vs MS is now LIVE', time: '2 mins' },
                { title: 'Points Awarded', desc: 'You gained 45 points', time: '12 mins' },
                { title: 'Rank Update', desc: 'You moved to rank #8', time: '1 hour' },
              ].map((notif, idx) => (
                <div key={idx} className="p-4 border-b border-[#E5E7EB] hover:bg-[#FAFAFA] transition-smooth cursor-pointer group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F1117] group-hover:text-[#10B981] transition-smooth">{notif.title}</p>
                      <p className="text-sm text-[#5B6B7A] mt-0.5 line-clamp-2">{notif.desc}</p>
                    </div>
                    <span className="text-xs text-[#5B6B7A] whitespace-nowrap flex-shrink-0 ml-2">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
