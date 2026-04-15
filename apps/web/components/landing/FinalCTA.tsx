"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function FinalCTA() {
  const [particles, setParticles] = useState<{ left: number; top: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setParticles(arr);
  }, []);

  return (
    <section className="cta-section" id="cta">
      {/* Aurora background animation */}
      <div className="cta-aurora" />
      <div className="cta-aurora cta-aurora--2" />
      <div className="cta-aurora cta-aurora--3" />

      {/* Particle dots */}
      <div className="cta-particles">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="cta-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="cta-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="cta-badge"
        >
          🚀 Free to Play — Connect Your Wallet
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="cta-headline"
        >
          Ready to become a
          <br />
          <span className="cta-headline__accent">fantasy cricket legend?</span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="cta-sub"
        >
          Join thousands of players competing for on-chain glory. <br />
          No account needed. Just your wallet and your cricket instincts.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/arena" className="cta-btn">
            <span className="cta-btn__text">Enter the Arena Now</span>
            <span className="cta-btn__arrow">→</span>
            <div className="cta-btn__glow" />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="cta-trust"
        >
          <span>🔒 Non-custodial</span>
          <span className="cta-trust__dot">•</span>
          <span>⛓️ Fully on-chain</span>
          <span className="cta-trust__dot">•</span>
          <span>💎 Real NFTs</span>
          <span className="cta-trust__dot">•</span>
          <span>🏆 Real rewards</span>
        </motion.div>
      </div>
    </section>
  );
}
