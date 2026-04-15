"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ROWS = [
  { rank: 1, user: "0x1A2b...F9e3", squad: "Thunder Hawks", score: 984, reward: "2.4 ETH", badge: "🥇" },
  { rank: 2, user: "0x8Cd4...3aB1", squad: "Storm Riders", score: 941, reward: "1.2 ETH", badge: "🥈" },
  { rank: 3, user: "0xF7a0...9cD2", squad: "Blaze Kings", score: 917, reward: "0.6 ETH", badge: "🥉" },
  { rank: 4, user: "0x2E3f...7bA8", squad: "Night Wolves", score: 893, reward: "0.3 ETH", badge: "4" },
  { rank: 5, user: "0x5B9c...1dC7", squad: "Desert Eagles", score: 876, reward: "0.2 ETH", badge: "5" },
];

const rowVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export function LeaderboardPreview() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="lb-section" id="leaderboard" ref={ref}>
      {/* Background grid */}
      <div className="lb-grid-bg" />

      <div className="lb-layout">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="lb-text"
        >
          <span className="section-tag">Live Rankings</span>
          <h2 className="section-title">
            Where the best<br />
            <span className="text-glow-gold">rise to the top</span>
          </h2>
          <p className="section-sub lb-text__sub">
            Real-time leaderboard powered by on-chain scores. Every fantasy point is computed directly from blockchain events — no manual intervention, no disputes.
          </p>
          <motion.a
            href="/arena"
            className="lb-text__cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            See Live Leaderboard →
          </motion.a>
        </motion.div>

        {/* Right: Table */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lb-table-wrap"
        >
          <div className="lb-table">
            {/* Header */}
            <div className="lb-table__header">
              <span>Rank</span>
              <span>Player</span>
              <span>Squad</span>
              <span>Score</span>
              <span>Reward</span>
            </div>

            {/* Rows */}
            {ROWS.map((row, i) => (
              <motion.div
                key={row.rank}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className={`lb-table__row ${row.rank === 1 ? "lb-table__row--gold" : ""}`}
              >
                <span className="lb-row__rank">
                  {row.rank <= 3 ? (
                    <span className="lb-row__badge">{row.badge}</span>
                  ) : (
                    <span className="lb-row__rank-num">{row.rank}</span>
                  )}
                </span>
                <span className="lb-row__user">{row.user}</span>
                <span className="lb-row__squad">{row.squad}</span>
                <span className="lb-row__score">{row.score.toLocaleString()}</span>
                <span className="lb-row__reward">{row.reward}</span>

                {/* Gold shimmer overlay for rank 1 */}
                {row.rank === 1 && <div className="lb-row__gold-shimmer" />}
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <p className="lb-table__note">
            * Rankings update in real-time as matches progress on-chain
          </p>
        </motion.div>
      </div>
    </section>
  );
}
