"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* ── Canvas particle system ─────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string;
    }

    const COLORS = ["#0DFFD7", "#7C3AED", "#3B82F6", "#F59E0B"];
    const count = Math.min(120, Math.floor((w * h) / 15000));

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pI = particles[i];
          const pJ = particles[j];
          if (!pI || !pJ) continue;
          const dx = pI.x - pJ.x;
          const dy = pI.y - pJ.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pI.x, pI.y);
            ctx.lineTo(pJ.x, pJ.y);
            ctx.strokeStyle = `rgba(13,255,215,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grd.addColorStop(0, p.color + "33");
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

/* ── Floating NFT Card ─────────────────────────────────────── */
function FloatingCard({
  delay, label, emoji, top, right, left, color
}: {
  delay: number; label: string; emoji: string;
  top?: string; right?: string; left?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className="hero-float-card"
      style={{ top, right, left, "--card-glow": color } as React.CSSProperties}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="hero-float-card__inner"
      >
        <span className="hero-float-card__emoji">{emoji}</span>
        <span className="hero-float-card__label">{label}</span>
        <span className="hero-float-card__badge">NFT</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Headline character-by-character animation ─────────────── */
const headline = "The Future of".split("");
const headline2 = "Fantasy Cricket".split("");

export function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      <ParticleCanvas />

      {/* Background orbs */}
      <div className="hero-orb hero-orb--teal" />
      <div className="hero-orb hero-orb--purple" />
      <div className="hero-orb hero-orb--blue" />

      {/* Floating cards */}
      <FloatingCard delay={1.2} label="Squad NFT" emoji="🏏" top="18%" right="8%" color="#0DFFD7" />
      <FloatingCard delay={1.5} label="Passport" emoji="🛂" top="55%" right="5%" color="#7C3AED" />
      <FloatingCard delay={1.8} label="#1 Rank" emoji="🏆" top="30%" left="5%" color="#F59E0B" />

      {/* Content */}
      <div className="hero-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="hero-badge"
        >
          <span className="hero-badge__dot" />
          <span>Live on WireFluid Testnet</span>
        </motion.div>

        {/* Headline */}
        <h1 className="hero-headline">
          <span className="hero-headline__line1">
            {headline.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.03, duration: 0.4 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          <br />
          <span className="hero-headline__line2">
            {headline2.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.04, duration: 0.4 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="hero-sub"
        >
          Build your dream squad. Mint as NFT. Win real crypto rewards — all on-chain, all yours.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6 }}
          className="hero-ctas"
        >
          <Link href="/arena" className="hero-cta-primary">
            <span className="hero-cta-primary__glow" />
            <span className="hero-cta-primary__text">Enter the Arena</span>
            <span className="hero-cta-primary__arrow">→</span>
          </Link>
          <a href="#how-it-works" className="hero-cta-secondary">
            How it Works
          </a>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="hero-trust"
        >
          {["🔒 On-Chain Secured", "⚡ Real-Time Scores", "💎 NFT Ownership", "🏆 Crypto Rewards"].map((pill) => (
            <span key={pill} className="hero-trust__pill">{pill}</span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="hero-scroll"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="hero-scroll__arrow"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
