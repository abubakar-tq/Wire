'use client';

import { Crown, Sparkles } from 'lucide-react';

interface NFTPreviewCardProps {
  squadName: string;
  captainName: string;
  squadId: string;
  playersCount: number;
}

export function NFTPreviewCard({ squadName, captainName, squadId, playersCount }: NFTPreviewCardProps) {
  return (
    <div className="group">
      <div className="relative bg-gradient-to-br from-teal-600 via-blue-600 to-purple-600 rounded-lg p-0.5 overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

        <div className="relative bg-white rounded-lg p-4">
          {/* Compact Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Squad NFT</p>
              <h3 className="text-lg font-bold text-slate-900">{squadName}</h3>
            </div>
            <div className="text-2xl font-black text-teal-600">{squadId}</div>
          </div>

          {/* Mini Pitch */}
          <div className="bg-teal-50 rounded p-2 mb-3 aspect-square relative overflow-hidden border border-teal-200">
            <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="40" ry="25" fill="none" stroke="#14B8A6" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="8" fill="none" stroke="#14B8A6" strokeWidth="0.5" />
            </svg>
            <div className="relative h-full flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-600">{playersCount}/11</span>
            </div>
          </div>

          {/* Captain Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs font-bold text-slate-700 uppercase">Captain</p>
            </div>
            <p className="font-semibold text-slate-900 text-sm truncate">{captainName || 'Not set'}</p>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
            <span>Ready to mint</span>
            <span className="font-semibold text-slate-900">Ethereum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
