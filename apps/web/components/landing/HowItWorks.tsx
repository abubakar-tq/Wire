"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    icon: "🦊",
    title: "Connect Your Wallet",
    desc: "Link MetaMask or any WalletConnect-compatible wallet. Your wallet is your identity — no signups, no emails, no middlemen.",
    glow: "#0DFFD7",
    tag: "Non-custodial",
  },
  {
    num: "02",
    icon: "🏏",
    title: "Build Your Dream Squad",
    desc: "Select 11 players from the live PSL roster. Pick your captain for 2× points, assign your vice-captain, and lock in your strategy.",
    glow: "#7C3AED",
    tag: "11 Players per Squad",
  },
  {
    num: "03",
    icon: "🎴",
    title: "Mint as NFT on-Chain",
    desc: "Your squad is minted as a unique FantasyTeamNFT on the WireFluid testnet. You own it. It's permanent. It's provably yours.",
    glow: "#3B82F6",
    tag: "ERC-721 NFT",
  },
  {
    num: "04",
    icon: "💰",
    title: "Win Crypto Rewards",
    desc: "Live scores update as the match plays. Top squads climb the leaderboard. Winners receive on-chain token rewards — claimable directly to your wallet.",
    glow: "#F59E0B",
    tag: "Real Rewards",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="hiw-section" id="how-it-works" ref={ref}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="section-header"
      >
        <span className="section-tag">How It Works</span>
        <h2 className="section-title">
          From wallet to winner in{" "}
          <span className="text-glow-teal">four steps</span>
        </h2>
        <p className="section-sub">
          No accounts. No forms. Just your wallet and your cricket knowledge.
        </p>
      </motion.div>

      {/* Steps grid */}
      <div className="hiw-grid">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="hiw-card"
            style={{ "--step-glow": step.glow } as React.CSSProperties}
          >
            {/* Number */}
            <span className="hiw-card__num">{step.num}</span>

            {/* Icon */}
            <div className="hiw-card__icon-wrap">
              <span className="hiw-card__icon">{step.icon}</span>
              <div className="hiw-card__icon-glow" />
            </div>

            {/* Content */}
            <div className="hiw-card__content">
              <div className="hiw-card__tag">{step.tag}</div>
              <h3 className="hiw-card__title">{step.title}</h3>
              <p className="hiw-card__desc">{step.desc}</p>
            </div>

            {/* Connector arrow (not for last item) */}
            {i < steps.length - 1 && (
              <div className="hiw-card__connector">→</div>
            )}

            {/* Hover border glow */}
            <div className="hiw-card__border" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
