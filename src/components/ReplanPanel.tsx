"use client";

import { useState } from "react";
import { Plan, EventFormData } from "@/types/plan";
import { formatCurrency } from "@/lib/budget";

interface ReplanPanelProps {
  currentPlan: Plan;
  eventData: EventFormData;
  onReplan: (newBudget: number, newGuestCount: number) => void;
  isLoading: boolean;
}

export default function ReplanPanel({
  currentPlan,
  eventData,
  onReplan,
  isLoading,
}: ReplanPanelProps) {
  const [newBudget, setNewBudget] = useState(eventData.budget);
  const [newGuestCount, setNewGuestCount] = useState(eventData.guests);
  const [hasChanges, setHasChanges] = useState(false);

  const budgetChanged = newBudget !== eventData.budget;
  const guestChanged = newGuestCount !== eventData.guests;
  const hasAnyChange = budgetChanged || guestChanged;

  const budgetDiff = newBudget - eventData.budget;
  const guestDiff = newGuestCount - eventData.guests;

  const handleReplan = () => {
    if (!hasAnyChange) return;
    onReplan(newBudget, newGuestCount);
    setHasChanges(true);
  };

  const selectedCurrency = eventData.currency;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Info Banner */}
      <div
        style={{
          background: "rgba(6, 182, 212, 0.08)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderRadius: "12px",
          padding: "14px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontSize: "0.82rem", color: "#22d3ee", fontWeight: 600, marginBottom: "3px" }}>
            Change Constraints
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: "1.5" }}>
            Adjust the budget or guest count below and Planora AI will generate a revised plan with trade-off analysis.
          </div>
        </div>
      </div>

      {/* Current Values */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "12px",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Current Budget
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#818cf8" }}>
            {formatCurrency(eventData.budget, selectedCurrency)}
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: "12px",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Current Guests
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#818cf8" }}>
            {eventData.guests.toLocaleString()}
          </div>
        </div>
      </div>

      {/* New Budget */}
      <div>
        <label htmlFor="new-budget" className="form-label">
          💰 New Budget
        </label>
        <input
          id="new-budget"
          type="number"
          className="form-input"
          min={1000}
          step={1000}
          value={newBudget}
          onChange={(e) => setNewBudget(parseFloat(e.target.value) || eventData.budget)}
        />
        {budgetChanged && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "6px",
              fontSize: "0.78rem",
              color: budgetDiff < 0 ? "#f87171" : "#34d399",
              fontWeight: 600,
            }}
          >
            {budgetDiff < 0 ? "📉" : "📈"}
            {budgetDiff < 0 ? "Reduced by" : "Increased by"}{" "}
            {formatCurrency(Math.abs(budgetDiff), selectedCurrency)}
            {budgetDiff < 0 && newBudget < eventData.budget * 0.8 && (
              <span style={{ color: "#f87171", marginLeft: "4px" }}>
                ⚠ Significant reduction
              </span>
            )}
          </div>
        )}
      </div>

      {/* New Guest Count */}
      <div>
        <label htmlFor="new-guests" className="form-label">
          👥 New Guest Count
        </label>
        <input
          id="new-guests"
          type="number"
          className="form-input"
          min={1}
          max={10000}
          value={newGuestCount}
          onChange={(e) => setNewGuestCount(parseInt(e.target.value) || eventData.guests)}
        />
        {guestChanged && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "6px",
              fontSize: "0.78rem",
              color: guestDiff > 0 ? "#fbbf24" : "#34d399",
              fontWeight: 600,
            }}
          >
            {guestDiff > 0 ? "📈" : "📉"}
            {guestDiff > 0 ? `Added ${guestDiff} guests` : `Removed ${Math.abs(guestDiff)} guests`}
            {guestDiff > 0 && (
              <span style={{ color: "#fbbf24", marginLeft: "4px" }}>
                ⚠ Review catering & venue
              </span>
            )}
          </div>
        )}
      </div>

      {/* Per-guest budget indicator */}
      {(budgetChanged || guestChanged) && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "0.82rem",
            color: "#94a3b8",
          }}
        >
          <span style={{ color: "#fbbf24", fontWeight: 600 }}>New per-guest budget: </span>
          {formatCurrency(Math.round(newBudget / Math.max(newGuestCount, 1)), selectedCurrency)}
          {" vs "}
          <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
            {formatCurrency(Math.round(eventData.budget / Math.max(eventData.guests, 1)), selectedCurrency)}
          </span>
        </div>
      )}

      {/* Replan Button */}
      <button
        id="replan-btn"
        className="btn-primary"
        onClick={handleReplan}
        disabled={isLoading || !hasAnyChange}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: !hasAnyChange ? 0.4 : 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {isLoading ? (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin-slow 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Replanning…
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Replan Event
          </>
        )}
      </button>

      {!hasAnyChange && (
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#475569" }}>
          Change budget or guest count above to replan
        </p>
      )}
    </div>
  );
}
