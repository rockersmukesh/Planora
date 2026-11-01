"use client";

import { BudgetAllocation } from "@/types/plan";
import { formatCurrency, getBudgetPercentage, getRemainingBudget } from "@/lib/budget";

interface BudgetBreakdownProps {
  allocations: BudgetAllocation[];
  totalBudget: number;
  currency: string;
}

const CATEGORY_COLORS = [
  { bg: "rgba(99, 102, 241, 0.8)", light: "rgba(99, 102, 241, 0.15)", text: "#818cf8" },
  { bg: "rgba(16, 185, 129, 0.8)", light: "rgba(16, 185, 129, 0.15)", text: "#34d399" },
  { bg: "rgba(236, 72, 153, 0.8)", light: "rgba(236, 72, 153, 0.15)", text: "#f472b6" },
  { bg: "rgba(245, 158, 11, 0.8)", light: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
  { bg: "rgba(6, 182, 212, 0.8)", light: "rgba(6, 182, 212, 0.15)", text: "#22d3ee" },
  { bg: "rgba(239, 68, 68, 0.8)", light: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
  { bg: "rgba(139, 92, 246, 0.8)", light: "rgba(139, 92, 246, 0.15)", text: "#a78bfa" },
  { bg: "rgba(20, 184, 166, 0.8)", light: "rgba(20, 184, 166, 0.15)", text: "#2dd4bf" },
];

export default function BudgetBreakdown({
  allocations,
  totalBudget,
  currency,
}: BudgetBreakdownProps) {
  const remaining = getRemainingBudget(allocations, totalBudget);
  const totalAllocated = totalBudget - remaining;
  const overBudget = remaining < 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Summary Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "12px",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Budget
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#818cf8", marginTop: "4px" }}>
            {formatCurrency(totalBudget, currency)}
          </div>
        </div>
        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "12px",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Allocated
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399", marginTop: "4px" }}>
            {formatCurrency(totalAllocated, currency)}
          </div>
        </div>
        <div
          style={{
            background: overBudget ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: `1px solid ${overBudget ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
            borderRadius: "12px",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {overBudget ? "Over Budget" : "Remaining"}
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: overBudget ? "#f87171" : "#fbbf24", marginTop: "4px" }}>
            {formatCurrency(Math.abs(remaining), currency)}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Budget Utilization</span>
          <span style={{ fontSize: "0.8rem", color: overBudget ? "#f87171" : "#f8fafc", fontWeight: 600 }}>
            {Math.min(getBudgetPercentage(totalAllocated, totalBudget), 100)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(getBudgetPercentage(totalAllocated, totalBudget), 100)}%`,
              background: overBudget
                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {allocations.map((allocation, index) => {
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          const pct = getBudgetPercentage(allocation.amount, totalBudget);
          return (
            <div
              key={`${allocation.category}-${index}`}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                padding: "12px",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: color.bg,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f8fafc" }}>
                      {allocation.category}
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: "1px" }}>
                      {allocation.reason}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: color.text }}>
                    {formatCurrency(allocation.amount, currency)}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{pct}%</div>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: color.bg,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
