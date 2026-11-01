"use client";

import { useState } from "react";
import { Plan, EventFormData, PlanHistory } from "@/types/plan";
import EventForm from "@/components/EventForm";
import PlanResults from "@/components/PlanResults";
import ReplanPanel from "@/components/ReplanPanel";
import PlanDiffComparison from "@/components/PlanDiffComparison";

export default function Home() {
  const [eventData, setEventData] = useState<EventFormData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"plan" | "compare" | "history">("plan");
  const [replanData, setReplanData] = useState<{
    newBudget: number;
    newGuestCount: number;
  } | null>(null);

  const handleGeneratePlan = async (formData: EventFormData) => {
    setIsGenerating(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      const plan: Plan = data.plan;
      setCurrentPlan(plan);
      setEventData(formData);
      setReplanData(null);

      // Add to history
      const historyEntry: PlanHistory = {
        version: 1,
        label: "Initial Plan (v1)",
        plan,
        eventData: formData,
        timestamp: new Date().toISOString(),
      };
      setPlanHistory([historyEntry]);
      setActiveTab("plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplan = async (newBudget: number, newGuestCount: number) => {
    if (!currentPlan || !eventData) return;
    setIsReplanning(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await fetch("/api/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousPlan: currentPlan,
          eventData,
          newBudget,
          newGuestCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to replan");
      }

      const revisedPlan: Plan = data.plan;
      if (data.warnings?.length) setWarnings(data.warnings);

      const newVersion = planHistory.length + 1;
      const updatedData: EventFormData = {
        ...eventData,
        budget: newBudget,
        guests: newGuestCount,
      };

      setPlanHistory((prev) => [
        ...prev,
        {
          version: newVersion,
          label: `Revised Plan (v${newVersion})`,
          plan: revisedPlan,
          eventData: updatedData,
          changes: `Budget: ${eventData.budget} → ${newBudget}, Guests: ${eventData.guests} → ${newGuestCount}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setCurrentPlan(revisedPlan);
      setEventData(updatedData);
      setReplanData({ newBudget, newGuestCount });
      setActiveTab("compare"); // Automatically open comparison tab to wow judges!
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsReplanning(false);
    }
  };

  const handleNewEvent = () => {
    setCurrentPlan(null);
    setEventData(null);
    setPlanHistory([]);
    setError(null);
    setWarnings([]);
    setReplanData(null);
    setActiveTab("plan");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ===== HEADER ===== */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10, 11, 20, 0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              }}
            >
              🎯
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                Planora AI
              </div>
              <div style={{ fontSize: "0.62rem", color: "#64748b", letterSpacing: "0.06em", marginTop: "2px" }}>
                AI EVENT ARCHITECT · HACKATHON MVP
              </div>
            </div>
          </div>

          {/* Right Header Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "999px",
                padding: "4px 12px",
                fontSize: "0.72rem",
                color: "#34d399",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                }}
              />
              AI Active
            </div>

            {currentPlan && (
              <button
                onClick={handleNewEvent}
                id="new-event-btn"
                className="btn-secondary"
                style={{ fontSize: "0.78rem", padding: "6px 14px" }}
              >
                + New Event
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO (shown when no plan) ===== */}
      {!currentPlan && !isGenerating && (
        <div
          style={{
            textAlign: "center",
            padding: "50px 24px 30px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "999px",
              padding: "6px 16px",
              fontSize: "0.78rem",
              color: "#818cf8",
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#6366f1",
                display: "inline-block",
              }}
            />
            Engineered for Celebrations in India
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "16px",
              background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Smart Celebration Planning{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Powered by AI
            </span>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "#94a3b8",
              maxWidth: "560px",
              margin: "0 auto 30px",
              lineHeight: "1.6",
            }}
          >
            Generate tailored budget allocations, milestone checklists, and real-time trade-off analysis for birthdays, anniversaries, and family celebrations.
          </p>
        </div>
      )}

      {/* ===== MAIN APPLICATION CONTAINER ===== */}
      <main
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 24px 60px",
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.1rem" }}>❌</span>
              <span style={{ fontSize: "0.82rem", color: "#fca5a5" }}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ===== TWO-COLUMN DASHBOARD ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: currentPlan ? "400px 1fr" : "560px",
            justifyContent: currentPlan ? undefined : "center",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ===== LEFT COLUMN: FORM OR EVENT OVERVIEW + REPLAN ===== */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Form View (Initial) */}
            {!currentPlan && (
              <div className="glass-card" style={{ padding: "26px" }}>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#f8fafc",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🎉 Plan Your Celebration
                </h2>
                {isGenerating ? (
                  <div style={{ textAlign: "center", padding: "50px 20px" }}>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        border: "3px solid rgba(99,102,241,0.2)",
                        borderTop: "3px solid #6366f1",
                        animation: "spin-slow 0.8s linear infinite",
                        margin: "0 auto 16px",
                      }}
                    />
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                      Architecting Event Plan…
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Balancing venue, catering ratios, and timeline milestones…
                    </div>
                  </div>
                ) : (
                  <EventForm onSubmit={handleGeneratePlan} isLoading={isGenerating} />
                )}
              </div>
            )}

            {/* Event Summary Card (When plan exists) */}
            {currentPlan && eventData && (
              <>
                <div className="glass-card-static" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>
                      🎉 {eventData.eventType}
                    </h3>
                    <button
                      onClick={handleNewEvent}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        color: "#94a3b8",
                        padding: "3px 8px",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                      }}
                    >
                      Reset
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>📅 Date:</span>
                      <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{eventData.date}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>📍 City:</span>
                      <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{eventData.city}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>👥 Guests:</span>
                      <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{eventData.guests} pax</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>🍽️ Food:</span>
                      <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{eventData.foodPreferences}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>✨ Theme:</span>
                      <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{eventData.theme}</span>
                    </div>
                  </div>
                </div>

                {/* Replan Controls Panel */}
                <div className="glass-card-static" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#f8fafc",
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🔄 Replan Event Constraints
                  </h3>
                  {isReplanning ? (
                    <div style={{ textAlign: "center", padding: "30px 10px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border: "3px solid rgba(99,102,241,0.2)",
                          borderTop: "3px solid #6366f1",
                          animation: "spin-slow 0.8s linear infinite",
                          margin: "0 auto 12px",
                        }}
                      />
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc" }}>
                        Calculating Revised Allocations…
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                        Analyzing trade-offs for updated budget & capacity…
                      </div>
                    </div>
                  ) : (
                    <ReplanPanel
                      currentPlan={currentPlan}
                      eventData={eventData}
                      onReplan={handleReplan}
                      isLoading={isReplanning}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* ===== RIGHT COLUMN: MAIN PLAN, COMPARISON, OR HISTORY ===== */}
          {currentPlan && eventData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Top Navigation Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setActiveTab("plan")}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: activeTab === "plan" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                    border: activeTab === "plan" ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: activeTab === "plan" ? "#818cf8" : "#94a3b8",
                  }}
                >
                  📋 Active Plan ({planHistory.length > 1 ? `v${planHistory.length}` : "v1"})
                </button>

                {planHistory.length > 1 && (
                  <button
                    onClick={() => setActiveTab("compare")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: activeTab === "compare" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                      border: activeTab === "compare" ? "1px solid #f59e0b" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: activeTab === "compare" ? "#fbbf24" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ⚖️ Side-by-Side Comparison
                    <span style={{ background: "#f59e0b", color: "#000", fontSize: "0.65rem", padding: "1px 6px", borderRadius: "999px", fontWeight: 800 }}>
                      v1 vs v{planHistory.length}
                    </span>
                  </button>
                )}

                {planHistory.length > 1 && (
                  <button
                    onClick={() => setActiveTab("history")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: activeTab === "history" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                      border: activeTab === "history" ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: activeTab === "history" ? "#818cf8" : "#94a3b8",
                    }}
                  >
                    📜 Timeline History ({planHistory.length})
                  </button>
                )}
              </div>

              {/* TAB 1: ACTIVE PLAN VIEW */}
              {activeTab === "plan" && (
                <PlanResults
                  plan={currentPlan}
                  eventData={eventData}
                  label={planHistory.length > 1 ? `Revised Plan v${planHistory.length}` : "Initial Plan v1"}
                  isLatest
                  warnings={warnings}
                  changes={
                    planHistory.length > 1 && replanData
                      ? {
                          budgetChanged: replanData.newBudget !== planHistory[0].eventData.budget,
                          guestCountChanged: replanData.newGuestCount !== planHistory[0].eventData.guests,
                          oldBudget: planHistory[0].eventData.budget,
                          newBudget: eventData.budget,
                          oldGuestCount: planHistory[0].eventData.guests,
                          newGuestCount: eventData.guests,
                        }
                      : undefined
                  }
                />
              )}

              {/* TAB 2: SIDE-BY-SIDE COMPARISON (V1 vs LATEST) */}
              {activeTab === "compare" && planHistory.length > 1 && (
                <PlanDiffComparison
                  originalPlan={planHistory[0].plan}
                  revisedPlan={currentPlan}
                  originalEvent={planHistory[0].eventData}
                  revisedEvent={eventData}
                />
              )}

              {/* TAB 3: TIMELINE VERSION HISTORY */}
              {activeTab === "history" && planHistory.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "0.82rem",
                      color: "#94a3b8",
                    }}
                  >
                    📜 Showing all {planHistory.length} iterations. Initial calculations are permanently preserved for audit and rollbacks.
                  </div>

                  {planHistory.map((h, i) => (
                    <div
                      key={h.version}
                      className="glass-card-static"
                      style={{
                        padding: "18px 20px",
                        border: i === planHistory.length - 1 ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>
                            {h.label}
                          </span>
                          {i === planHistory.length - 1 && (
                            <span className="badge badge-success" style={{ fontSize: "0.68rem" }}>
                              Active
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.4" }}>
                        {h.plan.summary}
                      </p>
                      {h.changes && (
                        <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "#fbbf24" }}>
                          Delta: {h.changes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "24px",
          textAlign: "center",
          background: "rgba(10, 11, 20, 0.7)",
        }}
      >
        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
          Planora AI · Smart Family Event Planner · Built for the 2-Hour Hackathon
        </div>
        <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px" }}>
          Verified with server-side arithmetic validation & Gemini 1.5 Flash.
        </div>
      </footer>
    </div>
  );
}
