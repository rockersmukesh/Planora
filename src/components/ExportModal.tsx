"use client";

import { useState } from "react";
import { Plan, EventFormData } from "@/types/plan";
import { formatCurrency } from "@/lib/budget";

interface ExportModalProps {
  plan: Plan;
  eventData: EventFormData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({
  plan,
  eventData,
  isOpen,
  onClose,
}: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "json">("whatsapp");

  if (!isOpen) return null;

  const currency = eventData.currency || "₹";
  const perGuest = Math.round(eventData.budget / Math.max(eventData.guests, 1));

  // WhatsApp family summary generator
  const generateWhatsAppMessage = () => {
    const allocationsText = plan.budget_allocations
      .map(
        (a) =>
          `• *${a.category}*: ${formatCurrency(a.amount, currency)} (${Math.round((a.amount / eventData.budget) * 100)}%)\n  _${a.reason}_`
      )
      .join("\n\n");

    const highPriorityTasks = plan.tasks
      .filter((t) => t.priority === "high")
      .map((t) => `▫️ ${t.title} (Due: ${t.due_date})`)
      .join("\n");

    return `🎉 *${eventData.eventType.toUpperCase()} – PLANORA AI EVENT BRIEF* 🎉
━━━━━━━━━━━━━━━━━━━━
📍 *Location*: ${eventData.city}
📅 *Date*: ${eventData.date}
👥 *Guests*: ${eventData.guests} (~${formatCurrency(perGuest, currency)}/person)
💰 *Total Budget*: ${formatCurrency(eventData.budget, currency)}
🍽️ *Food*: ${eventData.foodPreferences} | ✨ *Theme*: ${eventData.theme}

📋 *SUMMARY*:
${plan.summary}

📊 *BUDGET ALLOCATIONS*:
${allocationsText}

🚨 *KEY URGENT TASKS*:
${highPriorityTasks || "No urgent tasks flagged"}

━━━━━━━━━━━━━━━━━━━━
✨ _Planned with Planora AI – Plan Smarter, Celebrate Better._`;
  };

  const whatsAppText = generateWhatsAppMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ eventData, plan }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `planora-${eventData.eventType.toLowerCase().replace(/\s+/g, "-")}-plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              📤 Export & Share Event Plan
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
              Share this plan with family elders, vendors, or event coordinators.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.4rem",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Action Tabs */}
        <div style={{ display: "flex", gap: "8px", padding: "14px 24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <button
            onClick={() => setActiveTab("whatsapp")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "whatsapp" ? "2px solid #6366f1" : "2px solid transparent",
              color: activeTab === "whatsapp" ? "#818cf8" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            💬 WhatsApp / Text Summary
          </button>
          <button
            onClick={() => setActiveTab("json")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "json" ? "2px solid #6366f1" : "2px solid transparent",
              color: activeTab === "json" ? "#818cf8" : "#94a3b8",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📄 Raw JSON Data
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {activeTab === "whatsapp" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Ready to copy and paste into family WhatsApp group:
                </span>
                <button
                  onClick={handleCopy}
                  className="btn-primary"
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {copied ? "✓ Copied to Clipboard!" : "📋 Copy WhatsApp Text"}
                </button>
              </div>
              <textarea
                readOnly
                value={whatsAppText}
                rows={12}
                style={{
                  width: "100%",
                  background: "rgba(10, 11, 20, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "14px",
                  color: "#cbd5e1",
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                  lineHeight: "1.5",
                  resize: "none",
                }}
              />
            </div>
          )}

          {activeTab === "json" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Complete JSON payload with metadata and allocations:
                </span>
                <button
                  onClick={handleDownloadJSON}
                  className="btn-secondary"
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  💾 Download .json
                </button>
              </div>
              <textarea
                readOnly
                value={JSON.stringify({ eventData, plan }, null, 2)}
                rows={12}
                style={{
                  width: "100%",
                  background: "rgba(10, 11, 20, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "14px",
                  color: "#818cf8",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  lineHeight: "1.4",
                  resize: "none",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer with Quick Print */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(10, 11, 20, 0.5)",
          }}
        >
          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#94a3b8",
              padding: "8px 18px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
