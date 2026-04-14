'use client';

import { Crown, Sparkles } from 'lucide-react';

interface NFTPreviewCardProps {
  squadName: string;
  captainName: string;
}

export function NFTPreviewCard({ squadName, captainName }: NFTPreviewCardProps) {
  return (
    <div className="mb-8 group">
      <h3 className="font-bold text-[#0F1117] mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#F5A623]" />
        Premium NFT Card Preview
      </h3>
      <div className="relative bg-gradient-to-br from-[#F5A623] via-[#8B5CF6] to-[#10B981] rounded-xl p-1 overflow-hidden transition-all duration-300 group-hover:shadow-lg">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

        <div className="relative bg-white rounded-lg p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">FANTASY SQUAD</p>
              <h2 className="text-2xl font-bold text-[#0F1117] mt-1">{squadName}</h2>
            </div>
            <div className="text-3xl font-bold text-[#F5A623]">#2841</div>
          </div>

          {/* Mini Cricket Pitch */}
          <div className="bg-[#10B981]/5 rounded-lg p-4 mb-6 aspect-video relative overflow-hidden border border-[#10B981]/20">
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 120">
              <ellipse cx="100" cy="60" rx="80" ry="40" fill="none" stroke="#10B981" strokeWidth="1" />
              <circle cx="100" cy="60" r="15" fill="none" stroke="#10B981" strokeWidth="1" />
            </svg>
            <div className="relative h-full flex items-center justify-center">
              <p className="text-xs text-[#4B5563] font-medium">Cricket Pitch Visualization</p>
            </div>
          </div>

          {/* Captain Badge */}
          <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[#F5A623]" />
              <p className="text-xs font-bold text-[#4B5563] uppercase">Captain</p>
            </div>
            <p className="font-bold text-[#0F1117]">{captainName || 'TBD'}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[#4B5563]">
            <span>Blockchain: Ethereum</span>
            <span>Minted: Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
