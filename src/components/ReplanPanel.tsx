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
  eventData,
  onReplan,
  isLoading,
}: ReplanPanelProps) {
  const [newBudget, setNewBudget] = useState(eventData.budget);
  const [newGuestCount, setNewGuestCount] = useState(eventData.guests);

  const budgetChanged = newBudget !== eventData.budget;
  const guestChanged = newGuestCount !== eventData.guests;
  const hasAnyChange = budgetChanged || guestChanged;

  const budgetDiff = newBudget - eventData.budget;
  const guestDiff = newGuestCount - eventData.guests;

  const oldPerGuest = Math.round(eventData.budget / Math.max(eventData.guests, 1));
  const newPerGuest = Math.round(newBudget / Math.max(newGuestCount, 1));
  const perGuestDiff = newPerGuest - oldPerGuest;

  const currency = eventData.currency || "INR";

  // Quick Preset Actions
  const applyJudgeDemo = () => {
    setNewBudget(40000);
    setNewGuestCount(130);
  };

  const applyBudgetCut = () => {
    setNewBudget(Math.round(eventData.budget * 0.8));
  };

  const applyGuestIncrease = () => {
    setNewGuestCount(eventData.guests + 30);
  };

  const applyUpgrade = () => {
    setNewBudget(Math.round(eventData.budget * 1.25));
  };

  const handleReplan = () => {
    if (!hasAnyChange) return;
    onReplan(newBudget, newGuestCount);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 1-Click Judge Scenario Pill */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(99, 102, 241, 0.12))",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          borderRadius: "12px",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ⚡ Hackathon Demo Scenario
          </span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>From Build Plan</span>
        </div>
        <button
          type="button"
          onClick={applyJudgeDemo}
          style={{
            background: "rgba(6, 182, 212, 0.2)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            color: "#f8fafc",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          🎯 Test Case: ₹40,000 Budget & 130 Guests
        </button>
      </div>

      {/* Quick Adjustment Chips */}
      <div>
        <label className="form-label" style={{ marginBottom: "6px" }}>
          Quick Adjustment Presets
        </label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={applyBudgetCut}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📉 -20% Budget
          </button>
          <button
            type="button"
            onClick={applyGuestIncrease}
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "#38bdf8",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            👥 +30 Guests
          </button>
          <button
            type="button"
            onClick={applyUpgrade}
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34d399",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✨ +25% Upgrade
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label htmlFor="replan-budget" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>New Budget (₹)</span>
            {budgetChanged && (
              <span style={{ fontSize: "0.7rem", color: budgetDiff < 0 ? "#f87171" : "#34d399", fontWeight: 700 }}>
                {budgetDiff > 0 ? "+" : ""}{budgetDiff.toLocaleString()}
              </span>
            )}
          </label>
          <input
            id="replan-budget"
            type="number"
            className="form-input"
            step={1000}
            min={1000}
            value={newBudget}
            onChange={(e) => setNewBudget(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        <div>
          <label htmlFor="replan-guests" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>New Guests</span>
            {guestChanged && (
              <span style={{ fontSize: "0.7rem", color: guestDiff > 0 ? "#38bdf8" : "#f87171", fontWeight: 700 }}>
                {guestDiff > 0 ? "+" : ""}{guestDiff}
              </span>
            )}
          </label>
          <input
            id="replan-guests"
            type="number"
            className="form-input"
            min={1}
            max={10000}
            value={newGuestCount}
            onChange={(e) => setNewGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
          />
        </div>
      </div>

      {/* Live Impact Preview Card */}
      {hasAnyChange && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "0.78rem",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ fontWeight: 700, color: "#f8fafc" }}>
            ⚡ Pre-Replan Impact Preview:
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
            <span>Spend Per Guest:</span>
            <span style={{ fontWeight: 700, color: perGuestDiff < 0 ? "#fbbf24" : "#34d399" }}>
              {formatCurrency(newPerGuest, currency)} / pax ({perGuestDiff > 0 ? "+" : ""}{formatCurrency(perGuestDiff, currency)})
            </span>
          </div>

          {guestDiff > 0 && budgetDiff < 0 && (
            <div style={{ color: "#fca5a5", fontSize: "0.72rem", marginTop: "4px", lineHeight: "1.4" }}>
              ⚠️ Guest count increased while budget dropped. Planora AI will prioritize catering volume while optimizing venue and decor tiers.
            </div>
          )}
        </div>
      )}

      {/* Submit Replan Button */}
      <button
        onClick={handleReplan}
        id="replan-btn"
        disabled={isLoading || !hasAnyChange}
        className="btn-primary"
        style={{
          padding: "12px",
          fontSize: "0.88rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: !hasAnyChange ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                animation: "spin-slow 0.8s linear infinite",
                display: "inline-block",
              }}
            />
            Calculating Trade-offs…
          </>
        ) : (
          <>🔄 Replan with Updated Constraints</>
        )}
      </button>
    </div>
  );
}
