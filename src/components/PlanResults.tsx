"use client";

import { useState } from "react";
import { Plan, EventFormData } from "@/types/plan";
import { formatCurrency } from "@/lib/budget";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import TaskList from "@/components/TaskList";
import ExportModal from "@/components/ExportModal";

interface PlanResultsProps {
  plan: Plan;
  eventData: EventFormData;
  label?: string;
  isLatest?: boolean;
  warnings?: string[];
  changes?: {
    budgetChanged: boolean;
    guestCountChanged: boolean;
    oldBudget?: number;
    newBudget?: number;
    oldGuestCount?: number;
    newGuestCount?: number;
  };
}

export default function PlanResults({
  plan,
  eventData,
  label = "Generated Plan",
  isLatest = true,
  warnings = [],
  changes,
}: PlanResultsProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const currency = eventData.currency || "₹";
  const perGuest = Math.round(eventData.budget / Math.max(eventData.guests, 1));

  return (
    <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ===== EXECUTIVE HEADER ===== */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: "16px",
          padding: "22px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
              {isLatest && (
                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                  ✓ Active Version
                </span>
              )}
              {plan.isDemoMode && (
                <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>
                  ⚡ Simulation Engine
                </span>
              )}
            </div>

            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#f8fafc",
                lineHeight: "1.5",
                maxWidth: "650px",
              }}
            >
              {plan.summary}
            </h2>
          </div>

          {/* Export Action */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-secondary"
            style={{
              padding: "8px 14px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            📤 Export & Share
          </button>
        </div>

        {/* Quick Stats Ribbon */}
        <div
          style={{
            display: "flex",
            gap: "18px",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            flexWrap: "wrap",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>📅</span>
            <span style={{ color: "#cbd5e1" }}>{eventData.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>📍</span>
            <span style={{ color: "#cbd5e1" }}>{eventData.city}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>👥</span>
            <span style={{ color: "#cbd5e1" }}>{eventData.guests} guests</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>💰</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>
              {formatCurrency(eventData.budget, currency)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b" }}>🎯</span>
            <span style={{ color: "#38bdf8", fontWeight: 600 }}>
              ~{formatCurrency(perGuest, currency)}/pax
            </span>
          </div>
        </div>
      </div>

      {/* Changes Summary Banner */}
      {changes && (changes.budgetChanged || changes.guestCountChanged) && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "12px",
            padding: "14px 18px",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🔄 Constraint Changes Applied:</span>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "0.82rem" }}>
            {changes.budgetChanged && (
              <div>
                <span style={{ color: "#94a3b8" }}>Budget: </span>
                <span style={{ textDecoration: "line-through", color: "#64748b" }}>
                  {formatCurrency(changes.oldBudget!, currency)}
                </span>{" "}
                →{" "}
                <span style={{ color: changes.newBudget! < changes.oldBudget! ? "#f87171" : "#34d399", fontWeight: 700 }}>
                  {formatCurrency(changes.newBudget!, currency)}
                </span>
              </div>
            )}
            {changes.guestCountChanged && (
              <div>
                <span style={{ color: "#94a3b8" }}>Guest Count: </span>
                <span style={{ textDecoration: "line-through", color: "#64748b" }}>
                  {changes.oldGuestCount} pax
                </span>{" "}
                →{" "}
                <span style={{ color: changes.newGuestCount! > changes.oldGuestCount! ? "#38bdf8" : "#34d399", fontWeight: 700 }}>
                  {changes.newGuestCount} pax
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warnings Banner */}
      {warnings.length > 0 && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⚠️ Planning Impact Warnings:</span>
          </div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: "#fca5a5", lineHeight: "1.4" }}>
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* ===== SECTION 1: BUDGET ALLOCATIONS ===== */}
      <div className="glass-card-static" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          💰 Budget Allocation Breakdown
        </h3>
        <BudgetBreakdown
          allocations={plan.budget_allocations}
          totalBudget={eventData.budget}
          currency={currency}
          guestCount={eventData.guests}
        />
      </div>

      {/* ===== SECTION 2: TASK CHECKLIST ===== */}
      <div className="glass-card-static" style={{ padding: "24px" }}>
        <TaskList tasks={plan.tasks} />
      </div>

      {/* ===== SECTION 3: ASSUMPTIONS & STRATEGY ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Assumptions */}
        <div className="glass-card-static" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            📌 Planning Assumptions
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {plan.assumptions.map((item, i) => (
              <div
                key={i}
                style={{
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  lineHeight: "1.45",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#6366f1" }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade-Offs (if present) */}
        {plan.trade_offs && plan.trade_offs.length > 0 && (
          <div
            className="glass-card-static"
            style={{
              padding: "20px",
              background: "rgba(245, 158, 11, 0.04)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fbbf24", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              ⚖️ Strategic Trade-Offs
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {plan.trade_offs.map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.78rem",
                    color: "#cbd5e1",
                    lineHeight: "1.45",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#f59e0b" }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal Component */}
      <ExportModal
        plan={plan}
        eventData={eventData}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
