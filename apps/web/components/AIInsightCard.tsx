'use client';

import { useState } from 'react';
import { Wand2, Loader } from 'lucide-react';

interface AIInsightCardProps {
  onGetInsight: () => string;
}

const MOCK_INSIGHTS = [
  "Virat Kohli's form against pace bowlers is exceptional this season. Consider him as your captain for higher multiplier returns.",
  "The spin-heavy bowling attack favors all-rounders. Pairing Hardik Pandya with all-rounder all-stars will give you edge in the arena.",
  "Wicketkeepers on this ground have consistently accumulated points. Prioritize high-selection percentage keepers in your squad.",
];

export function AIInsightCard({ onGetInsight }: AIInsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetInsight = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const fallbackInsight = MOCK_INSIGHTS[Math.floor(Math.random() * MOCK_INSIGHTS.length)] ?? MOCK_INSIGHTS[0]!;
      const newInsight = onGetInsight() || fallbackInsight;
      setInsight(newInsight);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 border border-[#8B5CF6]/30 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#0F1117] flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#8B5CF6]" />
            AI Match Insight
          </h3>
          <p className="text-xs text-[#4B5563] mt-1">Smart recommendation engine</p>
        </div>
      </div>

      {insight ? (
        <div className="bg-white border border-[#8B5CF6]/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-[#0F1117] leading-relaxed">{insight}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-[#4B5563]">Click below to receive AI-powered squad insights</p>
        </div>
      )}

      <button
        onClick={handleGetInsight}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Get Insight
          </>
        )}
      </button>
    </div>
  );
}
