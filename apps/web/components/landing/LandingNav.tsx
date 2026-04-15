"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#nfts", label: "NFTs" },
    { href: "#leaderboard", label: "Leaderboard" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
    >
      <div className="landing-nav__inner">
        {/* Logo */}
        <Link href="/" className="landing-nav__logo">
          <span className="landing-nav__logo-icon">⚡</span>
          <span className="landing-nav__logo-text">
            Wire<span className="landing-nav__logo-accent">Fluid</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="landing-nav__links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav__link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="landing-nav__actions">
          <Link href="/arena" className="landing-nav__cta">
            <span>Enter Arena</span>
            <span className="landing-nav__cta-arrow">→</span>
          </Link>
          {/* Mobile hamburger */}
          <button
            className="landing-nav__hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`landing-nav__ham-line ${mobileOpen ? "open" : ""}`} />
            <span className={`landing-nav__ham-line mid ${mobileOpen ? "open" : ""}`} />
            <span className={`landing-nav__ham-line ${mobileOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="landing-nav__mobile"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="landing-nav__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/arena" className="landing-nav__mobile-cta" onClick={() => setMobileOpen(false)}>
              Enter Arena →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
