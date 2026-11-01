"use client";

import { Plan, EventFormData } from "@/types/plan";
import { formatCurrency } from "@/lib/budget";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import TaskList from "@/components/TaskList";

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
  return (
    <div
      className="animate-slide-up"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Plan Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: "14px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
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
                <span className="badge badge-info">✓ Latest</span>
              )}
            </div>
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "#e2e8f0",
                lineHeight: "1.5",
                maxWidth: "600px",
              }}
            >
              {plan.summary}
            </h2>
          </div>
          {plan.createdAt && (
            <div style={{ fontSize: "0.72rem", color: "#475569", flexShrink: 0 }}>
              {new Date(plan.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: "16px", marginTop: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>📅</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{eventData.date}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>📍</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{eventData.city}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>👥</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{eventData.guests} guests</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>💰</span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              {formatCurrency(eventData.budget, eventData.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      {changes && (changes.budgetChanged || changes.guestCountChanged) && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "12px",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 600, marginBottom: "8px" }}>
            🔄 What Changed
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {changes.budgetChanged && (
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Budget:{" "}
                <span style={{ textDecoration: "line-through", color: "#64748b" }}>
                  {formatCurrency(changes.oldBudget!, eventData.currency)}
                </span>{" "}
                →{" "}
                <span style={{ color: changes.newBudget! < changes.oldBudget! ? "#f87171" : "#34d399", fontWeight: 600 }}>
                  {formatCurrency(changes.newBudget!, eventData.currency)}
                </span>
              </div>
            )}
            {changes.guestCountChanged && (
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Guests:{" "}
                <span style={{ textDecoration: "line-through", color: "#64748b" }}>
                  {changes.oldGuestCount}
                </span>{" "}
                →{" "}
                <span style={{ color: changes.newGuestCount! > changes.oldGuestCount! ? "#fbbf24" : "#34d399", fontWeight: 600 }}>
                  {changes.newGuestCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: 600, marginBottom: "8px" }}>
            ⚠ Warnings
          </div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "4px" }}>
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* Budget Breakdown */}
      <div className="glass-card-static" style={{ padding: "20px" }}>
        <h3
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#f8fafc",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "0.8rem",
              color: "#34d399",
            }}
          >
            💰 Budget Breakdown
          </span>
        </h3>
        <BudgetBreakdown
          allocations={plan.budget_allocations}
          totalBudget={eventData.budget}
          currency={eventData.currency}
        />
      </div>

      {/* Tasks */}
      <div className="glass-card-static" style={{ padding: "20px" }}>
        <h3
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#f8fafc",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "0.8rem",
              color: "#818cf8",
            }}
          >
            ✅ Task Checklist
          </span>
          <span className="badge badge-purple">{plan.tasks.length} tasks</span>
        </h3>
        <TaskList tasks={plan.tasks} />
      </div>

      {/* Assumptions & Trade-offs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Assumptions */}
        {plan.assumptions.length > 0 && (
          <div
            className="glass-card-static"
            style={{ padding: "16px" }}
          >
            <h4
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#22d3ee",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              📋 Assumptions
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {plan.assumptions.map((assumption, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ color: "#06b6d4", flexShrink: 0, marginTop: "1px" }}>›</span>
                  {assumption}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade-offs */}
        {plan.trade_offs.length > 0 && (
          <div
            className="glass-card-static"
            style={{ padding: "16px" }}
          >
            <h4
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#fbbf24",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ⚖ Trade-offs
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {plan.trade_offs.map((tradeoff, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: "1px" }}>›</span>
                  {tradeoff}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
