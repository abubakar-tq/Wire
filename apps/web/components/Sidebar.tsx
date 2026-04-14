'use client';

import { LayoutDashboard, Zap, Trophy, Gift, Settings, BarChart3, PieChart, Wallet, ChevronRight } from 'lucide-react';
import { AppState, ViewType } from '@/types/index';
import { useState } from 'react';

interface SidebarProps {
  state: AppState;
  onViewChange: (view: ViewType) => void;
  hasAdminAccess?: boolean;
}

const PLAYER_MENU = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'DASHBOARD' as ViewType },
  { icon: Zap, label: 'Arena', view: 'ARENA' as ViewType },
  { icon: Trophy, label: 'Leaderboard', view: 'LEADERBOARD' as ViewType },
  { icon: Gift, label: 'Rewards', view: 'REWARDS' as ViewType },
];

const ADMIN_MENU = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'ADMIN_DASHBOARD' as ViewType },
  { icon: BarChart3, label: 'Score Panel', view: 'SCORE' as ViewType },
  { icon: Settings, label: 'Protocol', view: 'PROTOCOL' as ViewType },
  { icon: PieChart, label: 'Match', view: 'MATCH' as ViewType },
  { icon: Wallet, label: 'Treasury', view: 'TREASURY' as ViewType },
];

export function Sidebar({ state, onViewChange, hasAdminAccess = false }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = hasAdminAccess ? ADMIN_MENU : PLAYER_MENU;

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-[#E5E7EB] h-[calc(100vh-73px)] overflow-y-auto transition-smooth flex flex-col`}>
      {/* Menu Items */}
      <div className="flex-1 space-y-1 p-4">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = state.activeView === item.view;

          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/30 text-[#0F1117] font-semibold shadow-card'
                  : 'text-[#5B6B7A] hover:bg-[#FAFAFA] hover:text-[#0F1117]'
              }`}
              style={{
                animation: isActive ? `fadeInUp 0.4s ease-out ${idx * 50}ms forwards` : 'none',
                opacity: isActive ? 1 : undefined,
              }}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#10B981] to-[#059669]"></div>
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-smooth ${isActive ? 'text-[#10B981]' : 'group-hover:text-[#10B981]'}`} />
              {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
              {isActive && !isCollapsed && <ChevronRight className="w-4 h-4 text-[#10B981] opacity-0 group-hover:opacity-100 transition-smooth" />}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E7EB]"></div>

      {/* Toggle & Mode Switch */}
      <div className="p-4 space-y-3">
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-2.5 rounded-lg bg-[#FAFAFA] hover:bg-[#F0FDF4] hover:border-[#10B981] border border-[#E5E7EB] transition-smooth text-[#5B6B7A] hover:text-[#0F1117] font-medium text-sm flex items-center justify-center gap-2"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
          {!isCollapsed && 'Collapse'}
        </button>

        {/* Role Source */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
            <p className="text-xs font-semibold text-[#5B6B7A] px-2">ACCESS</p>
            <div className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              hasAdminAccess ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {hasAdminAccess ? 'On-chain admin roles' : 'Player wallet'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
