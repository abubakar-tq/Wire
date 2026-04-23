"use client";
import Link from "next/link";

const SOURCE_CODE_URL = "https://github.com/abubakar-tq/Wire";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "NFTs", href: "#nfts" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "FAQ", href: "#faq" },
];

const APP_LINKS = [
  { label: "Dashboard", href: "/arena" },
  { label: "Squad Builder", href: "/arena" },
  { label: "Arena", href: "/arena" },
  { label: "Rewards", href: "/arena" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: SOURCE_CODE_URL, icon: "⚡" },
  { label: "Twitter", href: "#", icon: "🐦" },
  { label: "Discord", href: "#", icon: "💬" },
];

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        {/* Brand */}
        <div className="landing-footer__brand">
          <div className="landing-footer__logo">
            <span className="landing-footer__logo-icon">⚡</span>
            <span className="landing-footer__logo-text">
              Wire<span className="landing-footer__logo-accent">Fluid</span>
            </span>
          </div>
          <p className="landing-footer__tagline">
            The future of fantasy cricket. On-chain, transparent, and yours.
          </p>
          <div className="landing-footer__socials">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} className="landing-footer__social" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="landing-footer__col">
          <h4 className="landing-footer__col-title">Explore</h4>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="landing-footer__col-link">
              {l.label}
            </a>
          ))}
        </div>

        {/* App */}
        <div className="landing-footer__col">
          <h4 className="landing-footer__col-title">Platform</h4>
          {APP_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="landing-footer__col-link">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Network info */}
        <div className="landing-footer__col">
          <h4 className="landing-footer__col-title">Network</h4>
          <div className="landing-footer__meta">
            <span className="landing-footer__meta-label">Chain ID</span>
            <span className="landing-footer__meta-value">92533</span>
          </div>
          <div className="landing-footer__meta">
            <span className="landing-footer__meta-label">Network</span>
            <span className="landing-footer__meta-value">WireFluid Testnet</span>
          </div>
          <div className="landing-footer__meta">
            <span className="landing-footer__meta-label">Indexer</span>
            <span className="landing-footer__meta-value">Ponder v0.12</span>
          </div>
          <div className="landing-footer__meta">
            <span className="landing-footer__meta-label">AI Guide</span>
            <span className="landing-footer__meta-value">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="landing-footer__bottom">
        <span>© {new Date().getFullYear()} WireFluid Arena. Powered by WireFluid Testnet.</span>
        <div className="landing-footer__bottom-right">
          <a
            href={SOURCE_CODE_URL}
            target="_blank"
            rel="noreferrer"
            className="landing-footer__source-link"
          >
            Source Code
          </a>
          <span className="landing-footer__status">
            <span className="landing-footer__status-dot" />
            Testnet Live
          </span>
        </div>
      </div>
    </footer>
  );
}
