"use client";

import { useState } from "react";
import { Task } from "@/types/plan";

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTask = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const completedCount = checked.size;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks
    .map((task, originalIndex) => ({ ...task, originalIndex }))
    .filter(({ title, priority, originalIndex }) => {
      if (searchTerm && !title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter === "high") return priority === "high";
      if (filter === "medium") return priority === "medium";
      if (filter === "low") return priority === "low";
      if (filter === "pending") return !checked.has(originalIndex);
      return true;
    });

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return {
          label: "Urgent",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          color: "#f87171",
        };
      case "medium":
        return {
          label: "Medium",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          color: "#fbbf24",
        };
      case "low":
        return {
          label: "Low",
          bg: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          color: "#34d399",
        };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* ===== PROGRESS BANNER ===== */}
      <div
        style={{
          background: "rgba(99, 102, 241, 0.07)",
          border: "1px solid rgba(99, 102, 241, 0.18)",
          borderRadius: "14px",
          padding: "16px 18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>📋</span>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc" }}>
              Milestone Checklist
            </span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#818cf8", fontWeight: 700 }}>
            {completedCount} of {tasks.length} Done ({progressPct}%)
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #6366f1, #10b981)",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* ===== CONTROLS: SEARCH + FILTER CHIPS ===== */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search milestones…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1 1 180px",
            background: "rgba(10, 11, 20, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "0.8rem",
            color: "#f8fafc",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${tasks.length})` },
            { id: "pending", label: "Pending" },
            { id: "high", label: "Urgent" },
            { id: "medium", label: "Medium" },
            { id: "low", label: "Low" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              style={{
                background: filter === item.id ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                border: filter === item.id ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: filter === item.id ? "#818cf8" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TASK ITEMS ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "0.82rem" }}>
            No milestones match your current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = checked.has(task.originalIndex);
            const badge = getPriorityBadge(task.priority);

            return (
              <div
                key={task.originalIndex}
                onClick={() => toggleTask(task.originalIndex)}
                style={{
                  background: isDone ? "rgba(16, 185, 129, 0.04)" : "rgba(20, 22, 39, 0.6)",
                  border: isDone ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: isDone ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {/* Custom checkmark circle */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      border: isDone ? "2px solid #10b981" : "2px solid rgba(255, 255, 255, 0.2)",
                      background: isDone ? "#10b981" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isDone ? "✓" : ""}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: isDone ? "#64748b" : "#f8fafc",
                        textDecoration: isDone ? "line-through" : "none",
                        lineHeight: "1.4",
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        📅 Due: {task.due_date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                <span
                  style={{
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
