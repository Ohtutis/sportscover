// Public collectible-card page — resolves the QR code on the printed card.
//
// ⚠️ PLACEHOLDER. This renders the registry data so scanned QR codes resolve
// end-to-end, but the real "digital twin" design (hero render, reveal video,
// wallpaper download, share, "View full collection") is still TODO.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCard } from "../../../lib/registry/cards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) return { title: "Card not found — Game Day Edition" };
  return {
    title: `${card.firstName} ${card.lastName} · ${card.styleName} — Game Day Edition`,
    description: card.playerHighlight,
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) notFound();

  const stats = [
    { label: "PPG", value: card.ppg },
    { label: "APG", value: card.apg },
    { label: "RPG", value: card.rpg },
  ].filter((s) => s.value);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0e16",
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <p style={{ letterSpacing: 3, fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}>
          GAME DAY EDITION · {card.styleName.toUpperCase()}
        </p>
        <h1 style={{ fontSize: 44, margin: "8px 0 4px", lineHeight: 1 }}>
          {card.firstName} {card.lastName}
        </h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          #{card.jerseyNumber} · {card.position} · {card.team}
        </p>

        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 12, margin: "28px 0" }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  padding: "18px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 12, letterSpacing: 2, color: "#1d4ed8", fontWeight: 700 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {card.playerHighlight && (
          <p style={{ color: "#cbd5e1", fontSize: 18 }}>{card.playerHighlight}</p>
        )}

        <p style={{ marginTop: 40, fontSize: 12, letterSpacing: 2, color: "#64748b" }}>
          {card.cardId}
          {card.serial ? ` · No. ${card.serial}` : ""} · FIRST EDITION · {card.season}
        </p>

        {/* TODO: hero render, reveal video, wallpaper download, share buttons,
            and a link to the athlete's full collection (/a/{athleteId}). */}
      </div>
    </main>
  );
}
