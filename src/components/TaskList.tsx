"use client";

import { useState } from "react";
import { Task } from "@/types/plan";

interface TaskListProps {
  tasks: Task[];
}

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    badgeClass: "badge-high",
    icon: "🔴",
    order: 0,
  },
  medium: {
    label: "Medium",
    badgeClass: "badge-medium",
    icon: "🟡",
    order: 1,
  },
  low: {
    label: "Low",
    badgeClass: "badge-low",
    icon: "🟢",
    order: 2,
  },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TaskList({ tasks }: TaskListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "pending">("all");

  const toggleTask = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const pa = PRIORITY_CONFIG[a.priority].order;
    const pb = PRIORITY_CONFIG[b.priority].order;
    if (pa !== pb) return pa - pb;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const filteredTasks = sortedTasks.filter((task, originalIndex) => {
    const idx = tasks.indexOf(task);
    if (filter === "pending") return !checked.has(idx);
    if (filter === "all") return true;
    return task.priority === filter;
  });

  const completedCount = checked.size;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Progress Header */}
      <div
        style={{
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
          borderRadius: "12px",
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            {completedCount} of {totalCount} tasks completed
          </span>
          <span style={{ fontSize: "0.85rem", color: "#818cf8", fontWeight: 700 }}>
            {progress}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {(["all", "high", "medium", "low", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s ease",
              background: filter === f ? "rgba(99, 102, 241, 0.2)" : "transparent",
              borderColor: filter === f ? "#6366f1" : "rgba(255,255,255,0.08)",
              color: filter === f ? "#818cf8" : "#64748b",
            }}
          >
            {f === "all" ? `All (${tasks.length})` : f === "pending" ? `Pending (${tasks.length - checked.size})` : f}
          </button>
        ))}
      </div>

      {/* Task Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "0.85rem" }}>
            No tasks match this filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const originalIdx = tasks.indexOf(task);
            const isChecked = checked.has(originalIdx);
            const config = PRIORITY_CONFIG[task.priority];
            const daysUntil = getDaysUntil(task.due_date);
            const isOverdue = daysUntil < 0;
            const isUrgent = daysUntil >= 0 && daysUntil <= 7;

            return (
              <div
                key={`${task.title}-${originalIdx}`}
                onClick={() => toggleTask(originalIdx)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => e.key === " " && toggleTask(originalIdx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: isChecked ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                  background: isChecked ? "rgba(16, 185, 129, 0.05)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: isChecked ? 0.6 : 1,
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    border: `2px solid ${isChecked ? "#10b981" : "#475569"}`,
                    background: isChecked ? "#10b981" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "1px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        color: isChecked ? "#64748b" : "#f8fafc",
                        textDecoration: isChecked ? "line-through" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {task.title}
                    </span>
                    <span className={`badge ${config.badgeClass}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                      📅 {formatDate(task.due_date)}
                    </span>
                    {!isChecked && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: isOverdue ? "#f87171" : isUrgent ? "#fbbf24" : "#64748b",
                        }}
                      >
                        {isOverdue
                          ? `⚠ ${Math.abs(daysUntil)}d overdue`
                          : daysUntil === 0
                          ? "• Due today"
                          : `• ${daysUntil}d left`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
