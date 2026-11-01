"use client";

import { BudgetAllocation } from "@/types/plan";
import { formatCurrency, getBudgetPercentage, getRemainingBudget } from "@/lib/budget";

interface BudgetBreakdownProps {
  allocations: BudgetAllocation[];
  totalBudget: number;
  currency: string;
  guestCount?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  catering: "🍲",
  food: "🍲",
  venue: "🏰",
  decor: "🎨",
  decoration: "🎨",
  photo: "📸",
  photography: "📸",
  cake: "🎂",
  favors: "🎁",
  sound: "🎵",
  audio: "🎵",
  music: "🎵",
  entertainment: "🎵",
  contingency: "🛡️",
  tips: "🛡️",
  transport: "🚗",
};

function getCategoryIcon(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🏷️";
}

const PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#38bdf8", // Sky
  "#f97316", // Orange
];

export default function BudgetBreakdown({
  allocations,
  totalBudget,
  currency,
  guestCount = 100,
}: BudgetBreakdownProps) {
  const remaining = getRemainingBudget(allocations, totalBudget);
  const totalAllocated = totalBudget - remaining;
  const overBudget = remaining < 0;
  const perGuest = Math.round(totalBudget / Math.max(guestCount, 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ===== EXECUTIVE METRIC TILES ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Budget
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#818cf8", marginTop: "4px" }}>
            {formatCurrency(totalBudget, currency)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
            100% Target Cap
          </div>
        </div>

        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Allocated Funds
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
            {formatCurrency(totalAllocated, currency)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
            {getBudgetPercentage(totalAllocated, totalBudget)}% utilized
          </div>
        </div>

        <div
          style={{
            background: overBudget ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
            border: `1px solid ${overBudget ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {overBudget ? "Over Budget" : "Reserve Buffer"}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: overBudget ? "#f87171" : "#fbbf24", marginTop: "4px" }}>
            {formatCurrency(Math.abs(remaining), currency)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
            {overBudget ? "Requires adjustment" : "Unallocated buffer"}
          </div>
        </div>

        <div
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Spend / Guest
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
            {formatCurrency(perGuest, currency)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
            Across {guestCount} guests
          </div>
        </div>
      </div>

      {/* ===== MULTI-SEGMENT PROPORTIONAL BAR ===== */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Category Distribution</span>
          <span style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
            {allocations.length} Distinct Categories
          </span>
        </div>
        <div
          style={{
            height: "10px",
            width: "100%",
            borderRadius: "999px",
            overflow: "hidden",
            display: "flex",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          {allocations.map((a, i) => {
            const widthPct = totalBudget > 0 ? (a.amount / totalBudget) * 100 : 0;
            const color = PALETTE[i % PALETTE.length];
            return (
              <div
                key={a.category}
                title={`${a.category}: ${formatCurrency(a.amount, currency)} (${Math.round(widthPct)}%)`}
                style={{
                  width: `${widthPct}%`,
                  height: "100%",
                  background: color,
                  transition: "width 0.4s ease",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ===== CATEGORY CARDS ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {allocations.map((item, index) => {
          const color = PALETTE[index % PALETTE.length];
          const pct = totalBudget > 0 ? Math.round((item.amount / totalBudget) * 100) : 0;
          const perPlate = guestCount > 0 ? Math.round(item.amount / guestCount) : 0;

          return (
            <div
              key={item.category}
              style={{
                background: "rgba(20, 22, 39, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
                        {item.category}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: color,
                          background: `${color}18`,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                      ~{formatCurrency(perPlate, currency)} per guest
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc" }}>
                    {formatCurrency(item.amount, currency)}
                  </div>
                </div>
              </div>

              {item.reason && (
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    lineHeight: "1.45",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    borderLeft: `2px solid ${color}`,
                  }}
                >
                  {item.reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
