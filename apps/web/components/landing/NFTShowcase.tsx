"use client";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";

interface NFTCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  rarity: string;
  attrs: { label: string; value: string }[];
  glow: string;
  delay: number;
}

function NFTCard({ emoji, title, subtitle, rarity, attrs, glow, delay }: NFTCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [15, -15]);
  const rotateY = useTransform(x, [-80, 80], [-15, 15]);

  const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className="nft-card"
      data-glow={glow}
    >
      {/* Glow border */}
      <div className="nft-card__glow" style={{ "--nft-glow": glow } as React.CSSProperties} />

      {/* Shimmer sweep */}
      <div className="nft-card__shimmer" />

      {/* Rarity band */}
      <div className="nft-card__rarity" style={{ "--nft-glow": glow } as React.CSSProperties}>
        {rarity}
      </div>

      {/* Main visual */}
      <div className="nft-card__visual" style={{ "--nft-glow": glow } as React.CSSProperties}>
        <motion.span
          className="nft-card__emoji"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {emoji}
        </motion.span>
        <div className="nft-card__visual-glow" style={{ "--nft-glow": glow } as React.CSSProperties} />
      </div>

      {/* Info */}
      <div className="nft-card__info">
        <h3 className="nft-card__title">{title}</h3>
        <p className="nft-card__subtitle">{subtitle}</p>
        <div className="nft-card__attrs">
          {attrs.map((attr) => (
            <div key={attr.label} className="nft-card__attr">
              <span className="nft-card__attr-label">{attr.label}</span>
              <span className="nft-card__attr-value" style={{ color: glow }}>
                {attr.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mint button */}
      <motion.a
        href="/arena"
        className="nft-card__btn"
        style={{ "--nft-glow": glow } as React.CSSProperties}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        Mint This NFT
      </motion.a>
    </motion.div>
  );
}

const nfts: NFTCardProps[] = [
  {
    emoji: "🛂",
    title: "Legacy Passport",
    subtitle: "Your on-chain identity. Soulbound to your wallet. Earns XP over time.",
    rarity: "⭐ SOULBOUND",
    glow: "#0DFFD7",
    delay: 0,
    attrs: [
      { label: "Type", value: "ERC-721" },
      { label: "Transferable", value: "No" },
      { label: "XP Tracking", value: "On-Chain" },
    ],
  },
  {
    emoji: "🏏",
    title: "Fantasy Squad NFT",
    subtitle: "Your curated 11-player squad. One per match. Captain earns 2× points.",
    rarity: "💎 LEGENDARY",
    glow: "#7C3AED",
    delay: 0.15,
    attrs: [
      { label: "Players", value: "11" },
      { label: "Captain", value: "2× Points" },
      { label: "Minted On", value: "WireFluid" },
    ],
  },
  {
    emoji: "🏆",
    title: "Champion Trophy",
    subtitle: "Awarded to contest winners. Proof of victory. Forever on the blockchain.",
    rarity: "🔥 RARE",
    glow: "#F59E0B",
    delay: 0.3,
    attrs: [
      { label: "Awarding", value: "Automatic" },
      { label: "Reward", value: "Crypto" },
      { label: "Verifiable", value: "On-Chain" },
    ],
  },
];

export function NFTShowcase() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="nft-section" id="nfts" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="section-header"
      >
        <span className="section-tag">NFT Ecosystem</span>
        <h2 className="section-title">
          Own your game. <span className="text-glow-purple">On-chain.</span>
        </h2>
        <p className="section-sub">
          Three unique NFT types. Every action you take in the arena is permanent, provable, and yours.
        </p>
      </motion.div>

      <div className="nft-grid" style={{ perspective: "1200px" }}>
        {nfts.map((nft) => (
          <NFTCard key={nft.title} {...nft} />
        ))}
      </div>
    </section>
  );
}
