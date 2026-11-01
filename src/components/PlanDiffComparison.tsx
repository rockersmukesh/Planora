"use client";

import { Plan, EventFormData } from "@/types/plan";
import { formatCurrency } from "@/lib/budget";

interface PlanDiffComparisonProps {
  originalPlan: Plan;
  revisedPlan: Plan;
  originalEvent: EventFormData;
  revisedEvent: EventFormData;
}

export default function PlanDiffComparison({
  originalPlan,
  revisedPlan,
  originalEvent,
  revisedEvent,
}: PlanDiffComparisonProps) {
  const currency = originalEvent.currency || "₹";

  const oldTotal = originalEvent.budget;
  const newTotal = revisedEvent.budget;
  const budgetDelta = newTotal - oldTotal;
  const budgetPctDelta = Math.round((budgetDelta / oldTotal) * 100);

  const oldGuests = originalEvent.guests;
  const newGuests = revisedEvent.guests;
  const guestDelta = newGuests - oldGuests;
  const guestPctDelta = Math.round((guestDelta / oldGuests) * 100);

  const oldPerGuest = Math.round(oldTotal / Math.max(oldGuests, 1));
  const newPerGuest = Math.round(newTotal / Math.max(newGuests, 1));
  const perGuestDelta = newPerGuest - oldPerGuest;
  const perGuestPctDelta = Math.round((perGuestDelta / oldPerGuest) * 100);

  // Map category diffs
  const categories = Array.from(
    new Set([
      ...originalPlan.budget_allocations.map((a) => a.category),
      ...revisedPlan.budget_allocations.map((a) => a.category),
    ])
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ===== EXECUTIVE DELTA METRICS ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Total Budget Card */}
        <div className="glass-card-static" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Total Budget
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc" }}>
              {formatCurrency(newTotal, currency)}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: budgetDelta < 0 ? "#f87171" : budgetDelta > 0 ? "#34d399" : "#94a3b8",
              }}
            >
              {budgetDelta !== 0 ? `${budgetDelta > 0 ? "+" : ""}${formatCurrency(budgetDelta, currency)} (${budgetPctDelta}%)` : "No Change"}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
            Was {formatCurrency(oldTotal, currency)}
          </div>
        </div>

        {/* Guest Count Card */}
        <div className="glass-card-static" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Guest Count
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc" }}>
              {newGuests} guests
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: guestDelta > 0 ? "#38bdf8" : guestDelta < 0 ? "#f87171" : "#94a3b8",
              }}
            >
              {guestDelta !== 0 ? `${guestDelta > 0 ? "+" : ""}${guestDelta} (${guestPctDelta}%)` : "No Change"}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
            Was {oldGuests} guests
          </div>
        </div>

        {/* Per-Guest Spend Card */}
        <div className="glass-card-static" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Spend Per Guest
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc" }}>
              {formatCurrency(newPerGuest, currency)}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: perGuestDelta < 0 ? "#fbbf24" : perGuestDelta > 0 ? "#34d399" : "#94a3b8",
              }}
            >
              {perGuestDelta !== 0 ? `${perGuestDelta > 0 ? "+" : ""}${formatCurrency(perGuestDelta, currency)} (${perGuestPctDelta}%)` : "No Change"}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
            Was {formatCurrency(oldPerGuest, currency)}
          </div>
        </div>
      </div>

      {/* ===== SIDE-BY-SIDE CATEGORY DIFF TABLE ===== */}
      <div className="glass-card-static" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            📊 Category Allocation Shift
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Original v1 vs Revised Plan
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Original (v1)</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Revised</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Variance</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Strategy Shift</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => {
                const oldAlloc = originalPlan.budget_allocations.find((a) => a.category === cat);
                const newAlloc = revisedPlan.budget_allocations.find((a) => a.category === cat);
                const oldAmt = oldAlloc ? oldAlloc.amount : 0;
                const newAmt = newAlloc ? newAlloc.amount : 0;
                const delta = newAmt - oldAmt;

                return (
                  <tr
                    key={cat}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px", color: "#f8fafc", fontWeight: 600 }}>
                      {cat}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#94a3b8" }}>
                      {formatCurrency(oldAmt, currency)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#f8fafc", fontWeight: 700 }}>
                      {formatCurrency(newAmt, currency)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {delta === 0 ? (
                        <span style={{ color: "#64748b" }}>—</span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: delta > 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                            color: delta > 0 ? "#34d399" : "#f87171",
                          }}
                        >
                          {delta > 0 ? "+" : ""}
                          {formatCurrency(delta, currency)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px", color: "#94a3b8", fontSize: "0.75rem", maxWidth: "320px", lineHeight: "1.4" }}>
                      {newAlloc?.reason || "Category retained"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== AI TRADE-OFFS & CONSTRAINTS ===== */}
      {revisedPlan.trade_offs && revisedPlan.trade_offs.length > 0 && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.2rem" }}>⚖️</span>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fbbf24" }}>
              Trade-Offs & Strategic Impact (AI Analysis)
            </h4>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "14px" }}>
            To satisfy the revised constraints ({newGuests} guests under {formatCurrency(newTotal, currency)}), Planora AI made the following practical trade-offs:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {revisedPlan.trade_offs.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  fontSize: "0.82rem",
                  color: "#e2e8f0",
                  lineHeight: "1.5",
                  background: "rgba(245, 158, 11, 0.04)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  borderLeft: "3px solid #f59e0b",
                }}
              >
                <span>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
