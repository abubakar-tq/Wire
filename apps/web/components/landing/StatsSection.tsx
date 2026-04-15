"use client";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  glow: string;
  delay: number;
}

function StatCounter({ value, suffix, label, glow, delay }: StatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      delay,
      duration: 2.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toLocaleString() + suffix;
        }
      },
    });
    return controls.stop;
  }, [inView, motionVal, value, suffix, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.7 }}
      className="stat-item"
    >
      <span
        className="stat-item__value"
        style={{ "--stat-glow": glow } as React.CSSProperties}
        ref={ref}
      >
        0{suffix}
      </span>
      <div className="stat-item__line" style={{ background: glow }} />
      <span className="stat-item__label">{label}</span>
    </motion.div>
  );
}

const stats: StatProps[] = [
  { value: 10000, suffix: "+", label: "Active Players", glow: "#0DFFD7", delay: 0 },
  { value: 500, suffix: "+", label: "Matches Indexed", glow: "#7C3AED", delay: 0.15 },
  { value: 100, suffix: "%", label: "On-Chain Transparency", glow: "#3B82F6", delay: 0.3 },
  { value: 50000, suffix: "+", label: "NFTs Minted", glow: "#F59E0B", delay: 0.45 },
];

export function StatsSection() {
  return (
    <section className="stats-section" id="stats">
      {/* Aurora background */}
      <div className="stats-aurora" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section-header"
      >
        <span className="section-tag">By the Numbers</span>
        <h2 className="section-title">
          A platform built for <span className="text-glow-teal">champions</span>
        </h2>
      </motion.div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
