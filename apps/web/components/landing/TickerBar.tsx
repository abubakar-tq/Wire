"use client";
import { motion } from "framer-motion";

const ITEMS = [
  "⚡ Real-Time Scoring", "🏏 PSL Fantasy Cricket", "💎 NFT Squads",
  "🔒 100% On-Chain", "🏆 Crypto Prizes", "🛂 Soulbound Passports",
  "⚡ Real-Time Scoring", "🏏 PSL Fantasy Cricket", "💎 NFT Squads",
  "🔒 100% On-Chain", "🏆 Crypto Prizes", "🛂 Soulbound Passports",
];

export function TickerBar() {
  return (
    <div className="ticker-bar">
      <div className="ticker-bar__track">
        <motion.div
          className="ticker-bar__inner"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {ITEMS.map((item, i) => (
            <span key={i} className="ticker-bar__item">
              <span className="ticker-bar__dot" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
