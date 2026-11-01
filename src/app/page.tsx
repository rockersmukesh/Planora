"use client";

import { useState } from "react";
import { Plan, EventFormData, PlanHistory } from "@/types/plan";
import EventForm from "@/components/EventForm";
import PlanResults from "@/components/PlanResults";
import ReplanPanel from "@/components/ReplanPanel";

export default function Home() {
  const [eventData, setEventData] = useState<EventFormData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [lastChanges, setLastChanges] = useState<PlanHistory["changes"] | undefined>(undefined);
  const [activeHistoryTab, setActiveHistoryTab] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"plan" | "replan" | "history">("plan");
  const [replanData, setReplanData] = useState<{
    newBudget: number;
    newGuestCount: number;
  } | null>(null);

  const handleGeneratePlan = async (formData: EventFormData) => {
    setIsGenerating(true);
    setError(null);
    setWarnings([]);
    setLastChanges(undefined);

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
        label: "Initial Plan",
        plan,
        timestamp: new Date().toISOString(),
      };
      setPlanHistory([historyEntry]);
      setActiveSection("plan");
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

      const changes = data.changes;
      setLastChanges(
        `Budget: ${changes?.oldBudget ?? eventData.budget} → ${changes?.newBudget ?? newBudget}, Guests: ${changes?.oldGuestCount ?? eventData.guests} → ${changes?.newGuestCount ?? newGuestCount}`
      );

      // Save old plan to history, update current
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
          label: `Revised Plan v${newVersion}`,
          plan: revisedPlan,
          changes: `Budget: ${eventData.budget} → ${newBudget}, Guests: ${eventData.guests} → ${newGuestCount}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setCurrentPlan(revisedPlan);
      setEventData(updatedData);
      setReplanData({ newBudget, newGuestCount });
      setActiveSection("plan");
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
    setLastChanges(undefined);
    setReplanData(null);
    setActiveSection("plan");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ===== HEADER ===== */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10, 11, 20, 0.8)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
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
                  backgroundClip: "text",
                  lineHeight: 1,
                }}
              >
                Planora AI
              </div>
              <div style={{ fontSize: "0.65rem", color: "#475569", letterSpacing: "0.06em" }}>
                PLAN SMARTER · CELEBRATE BETTER
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {currentPlan && (
              <span
                className="badge badge-info"
                style={{ fontSize: "0.72rem" }}
              >
                ✨ {planHistory.length} plan{planHistory.length > 1 ? "s" : ""} generated
              </span>
            )}
            {currentPlan && (
              <button
                onClick={handleNewEvent}
                id="new-event-btn"
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "8px 16px" }}
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
            padding: "60px 24px 40px",
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
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#6366f1",
                animation: "pulse-glow 2s infinite",
                display: "inline-block",
              }}
            />
            Powered by Gemini AI
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "16px",
              background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI-Powered Event Planning{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Made Simple
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#64748b",
              maxWidth: "500px",
              margin: "0 auto 40px",
              lineHeight: "1.6",
            }}
          >
            Enter your event details and let Planora AI generate a complete plan —
            budget breakdown, task checklist, and smart trade-off analysis.
          </p>
          {/* Feature chips */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "40px",
            }}
          >
            {[
              { icon: "💰", label: "Budget Allocation" },
              { icon: "✅", label: "Task Checklist" },
              { icon: "🔄", label: "Smart Replanning" },
              { icon: "⚖", label: "Trade-off Analysis" },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {f.icon} {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main
        style={{
          maxWidth: "1400px",
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
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>❌</span>
            <div>
              <div style={{ fontSize: "0.85rem", color: "#f87171", fontWeight: 600, marginBottom: "2px" }}>
                Error
              </div>
              <div style={{ fontSize: "0.8rem", color: "#fca5a5" }}>{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontSize: "1.1rem",
                padding: "0 4px",
              }}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* ===== TWO-COLUMN LAYOUT ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: currentPlan ? "380px 1fr" : "500px",
            justifyContent: currentPlan ? undefined : "center",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ===== LEFT PANEL ===== */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Event Form Card */}
            {!currentPlan && (
              <div className="glass-card" style={{ padding: "28px" }}>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#f8fafc",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🎉 Create Your Event
                </h2>
                {isGenerating ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        border: "3px solid rgba(99,102,241,0.2)",
                        borderTop: "3px solid #6366f1",
                        animation: "spin-slow 1s linear infinite",
                        margin: "0 auto 20px",
                      }}
                    />
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#f8fafc", marginBottom: "8px" }}>
                      Generating Your Plan
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                      Planora AI is crafting your personalized event plan…
                    </div>
                  </div>
                ) : (
                  <EventForm onSubmit={handleGeneratePlan} isLoading={isGenerating} />
                )}
              </div>
            )}

            {/* Compact event info when plan exists */}
            {currentPlan && eventData && (
              <>
                <div className="glass-card-static" style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>
                      🎉 {eventData.eventType}
                    </h3>
                    <button
                      onClick={handleNewEvent}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        color: "#64748b",
                        padding: "3px 8px",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                      { icon: "📅", value: eventData.date },
                      { icon: "📍", value: eventData.city },
                      { icon: "👥", value: `${eventData.guests} guests` },
                      { icon: "🍽️", value: eventData.foodPreferences },
                      { icon: "✨", value: eventData.theme },
                    ].map((item) => (
                      <div key={item.icon} style={{ display: "flex", gap: "8px", fontSize: "0.8rem" }}>
                        <span style={{ color: "#64748b", width: "18px" }}>{item.icon}</span>
                        <span style={{ color: "#94a3b8" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Replan Panel */}
                <div className="glass-card-static" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "#f8fafc",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🔄 Replan Event
                  </h3>
                  {isReplanning ? (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border: "3px solid rgba(99,102,241,0.2)",
                          borderTop: "3px solid #6366f1",
                          animation: "spin-slow 1s linear infinite",
                          margin: "0 auto 12px",
                        }}
                      />
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        Replanning with new constraints…
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

          {/* ===== RIGHT PANEL ===== */}
          {currentPlan && eventData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Section Tabs */}
              {planHistory.length > 1 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["plan", "history"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSection(tab)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "10px",
                        border: "1px solid",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.2s ease",
                        background: activeSection === tab ? "rgba(99,102,241,0.2)" : "transparent",
                        borderColor: activeSection === tab ? "#6366f1" : "rgba(255,255,255,0.08)",
                        color: activeSection === tab ? "#818cf8" : "#64748b",
                      }}
                    >
                      {tab === "plan" ? "📋 Current Plan" : `📜 History (${planHistory.length})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Current Plan */}
              {activeSection === "plan" && (
                <PlanResults
                  plan={currentPlan}
                  eventData={eventData}
                  label={planHistory.length > 1 ? `Revised Plan v${planHistory.length}` : "Initial Plan"}
                  isLatest
                  warnings={warnings}
                  changes={
                    planHistory.length > 1 && replanData
                      ? {
                          budgetChanged: replanData.newBudget !== (planHistory[planHistory.length - 2]?.plan ? eventData.budget : eventData.budget),
                          guestCountChanged: replanData.newGuestCount !== eventData.guests,
                          oldBudget: planHistory[planHistory.length - 2]
                            ? planHistory[planHistory.length - 2].plan.budget_allocations.reduce(
                                (s, a) => s + a.amount,
                                0
                              )
                            : undefined,
                          newBudget: eventData.budget,
                          oldGuestCount: planHistory[planHistory.length - 2]
                            ? eventData.guests
                            : undefined,
                          newGuestCount: eventData.guests,
                        }
                      : undefined
                  }
                />
              )}

              {/* History View */}
              {activeSection === "history" && planHistory.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontSize: "0.82rem",
                      color: "#64748b",
                    }}
                  >
                    📜 Showing all {planHistory.length} plan version{planHistory.length > 1 ? "s" : ""}. The original plan is preserved for comparison.
                  </div>

                  {/* History Tabs */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {planHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveHistoryTab(i)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          border: "1px solid",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          background:
                            (activeHistoryTab === null ? i === planHistory.length - 1 : activeHistoryTab === i)
                              ? "rgba(99,102,241,0.2)"
                              : "transparent",
                          borderColor:
                            (activeHistoryTab === null ? i === planHistory.length - 1 : activeHistoryTab === i)
                              ? "#6366f1"
                              : "rgba(255,255,255,0.08)",
                          color:
                            (activeHistoryTab === null ? i === planHistory.length - 1 : activeHistoryTab === i)
                              ? "#818cf8"
                              : "#64748b",
                        }}
                      >
                        v{h.version}
                        {i === planHistory.length - 1 && (
                          <span style={{ color: "#34d399", marginLeft: "4px" }}>●</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Display selected history entry */}
                  {(() => {
                    const idx =
                      activeHistoryTab === null ? planHistory.length - 1 : activeHistoryTab;
                    const entry = planHistory[idx];
                    if (!entry) return null;
                    return (
                      <PlanResults
                        plan={entry.plan}
                        eventData={eventData}
                        label={entry.label}
                        isLatest={idx === planHistory.length - 1}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#334155" }}>
          Planora AI · AI-Powered Family Event Planner · Built with Next.js & Gemini AI
        </div>
        <div style={{ fontSize: "0.7rem", color: "#1e293b", marginTop: "4px" }}>
          ⚠ Budget figures are planning estimates. Not confirmed prices or vendor quotes.
        </div>
      </footer>
    </div>
  );
}
