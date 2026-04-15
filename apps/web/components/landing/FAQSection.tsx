"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useInView } from "framer-motion";

const FAQS = [
  {
    q: "What is Web3 fantasy cricket?",
    a: "Web3 fantasy cricket combines traditional fantasy sports with blockchain technology. Your squad is a real NFT that you own, your scores are computed on-chain, and your winnings are paid out in crypto — all verifiable, all transparent.",
  },
  {
    q: "Do I need to know about crypto to play?",
    a: "You just need a MetaMask wallet (free to install). If you can connect to a website with it, you can play WireFluid Arena. We handle all the blockchain complexity in the background.",
  },
  {
    q: "What wallets are supported?",
    a: "Any WalletConnect-compatible wallet works: MetaMask, Coinbase Wallet, Rainbow Wallet, Trust Wallet, and many more. You can also use browser extension wallets.",
  },
  {
    q: "How are fantasy points calculated?",
    a: "Points are calculated from real match statistics submitted on-chain by authorized score publishers. Runs, wickets, catches, sixes — every action contributes to your squad's score using a transparent, immutable point system.",
  },
  {
    q: "Are the rewards real money?",
    a: "Yes. Rewards are distributed in the native testnet token. As we move towards mainnet, these will be real on-chain value. Your wallet, your rules.",
  },
  {
    q: "What network does WireFluid run on?",
    a: "WireFluid runs on the WireFluid Testnet (Chain ID: 92533). You can add it to MetaMask automatically when you connect your wallet through our app.",
  },
  {
    q: "Can I trade my Fantasy Squad NFT?",
    a: "Yes! Fantasy Squad NFTs are tradable ERC-721 tokens. Once minted, you own them completely and can transfer or sell them. The Legacy Passport NFT is soulbound (non-transferable) as it represents your identity.",
  },
];

interface FAQItemProps {
  q: string;
  a: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ q, a, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
    >
      <button className="faq-item__trigger" onClick={onToggle}>
        <span className="faq-item__num">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="faq-item__q">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="faq-item__icon"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="faq-item__answer-wrap"
          >
            <p className="faq-item__answer">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq-section" id="faq">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section-header"
      >
        <span className="section-tag">FAQ</span>
        <h2 className="section-title">
          Questions? <span className="text-glow-teal">Answered.</span>
        </h2>
        <p className="section-sub">
          Everything you need to know before entering the arena.
        </p>
      </motion.div>

      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <FAQItem
            key={i}
            q={faq.q}
            a={faq.a}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}
