"use client";

import { useState, useEffect } from "react";
import { EventFormData } from "@/types/plan";

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isLoading: boolean;
}

const EVENT_TYPES = [
  "Birthday Party",
  "Anniversary Celebration",
  "Family Reunion",
  "Baby Shower",
  "Engagement Party",
  "Retirement Party",
  "Housewarming (Griha Pravesh)",
  "Festive Dinner (Diwali/Eid/Christmas)",
];

const QUICK_CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Jaipur",
];

const FOOD_PREFERENCES = [
  "Vegetarian",
  "Pure Jain",
  "Non-Veg & Veg",
  "Multi-Cuisine Buffet",
  "Street Food & Live Chaat Stations",
  "Traditional Regional Thali",
];

const THEMES = [
  "Elegant & Classic",
  "Bollywood Glamour",
  "Royal & Luxurious",
  "Floral & Garden",
  "Pastel Dreams",
  "Rustic & Bohemian",
  "Vintage & Retro",
];

export default function EventForm({ onSubmit, isLoading }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    eventType: "",
    date: "",
    city: "",
    guests: 100,
    budget: 50000,
    currency: "INR",
    foodPreferences: "",
    theme: "",
    additionalNotes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  const loadDemoScenario = () => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    const targetDate = d.toISOString().split("T")[0];

    setForm({
      eventType: "Birthday Party",
      date: targetDate,
      city: "Mumbai",
      guests: 100,
      budget: 50000,
      currency: "INR",
      foodPreferences: "Vegetarian",
      theme: "Elegant & Classic",
      additionalNotes: "Grand family birthday celebration. Need welcoming atmosphere for elders and engaging dessert counter.",
    });
    setErrors({});
  };

  const loadAnniversaryScenario = () => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    const targetDate = d.toISOString().split("T")[0];

    setForm({
      eventType: "Anniversary Celebration",
      date: targetDate,
      city: "Delhi NCR",
      guests: 80,
      budget: 85000,
      currency: "INR",
      foodPreferences: "Multi-Cuisine Buffet",
      theme: "Royal & Luxurious",
      additionalNotes: "25th Silver Jubilee wedding anniversary. High priority on sound, video projection, and stage decor.",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    if (!form.eventType) newErrors.eventType = "Please select an event type";
    if (!form.date) newErrors.date = "Please select a date";
    if (!form.city.trim()) newErrors.city = "Please enter a city";
    if (form.guests < 1) newErrors.guests = "At least 1 guest required";
    if (form.guests > 10000) newErrors.guests = "Maximum 10,000 guests";
    if (form.budget < 1000) newErrors.budget = "Minimum budget is ₹1,000";
    if (!form.foodPreferences) newErrors.foodPreferences = "Please select food preferences";
    if (!form.theme) newErrors.theme = "Please select a theme";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const perGuest = Math.round(form.budget / Math.max(form.guests, 1));

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ===== ONE-CLICK JUDGE DEMO BANNER ===== */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "12px",
          padding: "12px 14px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
            ⚡ Hackathon Demo Presets
          </span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>1-Click Auto-Fill</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={loadDemoScenario}
            style={{
              flex: "1 1 auto",
              background: "rgba(99, 102, 241, 0.25)",
              border: "1px solid rgba(99, 102, 241, 0.5)",
              color: "#f8fafc",
              padding: "7px 12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            🎂 Mumbai Birthday · ₹50k · 100 pax
          </button>
          <button
            type="button"
            onClick={loadAnniversaryScenario}
            style={{
              flex: "1 1 auto",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#cbd5e1",
              padding: "7px 12px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            💍 Delhi Jubilee · ₹85k · 80 pax
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        {/* Event Type */}
        <div>
          <label htmlFor="eventType" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>🎉 Event Type</span>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Required</span>
          </label>
          <select
            id="eventType"
            className="form-input"
            value={form.eventType}
            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
          >
            <option value="">Select celebration type…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.eventType}</p>
          )}
        </div>

        {/* Date & City (2 columns) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label htmlFor="eventDate" className="form-label">
              📅 Event Date
            </label>
            <input
              id="eventDate"
              type="date"
              className="form-input"
              min={minDate || undefined}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            {errors.date && (
              <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="form-label">
              📍 City / Location
            </label>
            <input
              id="city"
              type="text"
              className="form-input"
              placeholder="e.g., Mumbai"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            {errors.city && (
              <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.city}</p>
            )}
          </div>
        </div>

        {/* Quick City Chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "-6px" }}>
          {QUICK_CITIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setForm((f) => ({ ...f, city: c }))}
              style={{
                background: form.city === c ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                border: form.city === c ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "0.72rem",
                color: form.city === c ? "#818cf8" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Guest Count & Budget (2 columns) with dynamic metric pill */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label htmlFor="guests" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>👥 Guests</span>
              <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600 }}>{form.guests} pax</span>
            </label>
            <input
              id="guests"
              type="number"
              className="form-input"
              min={1}
              max={10000}
              value={form.guests}
              onChange={(e) => setForm((f) => ({ ...f, guests: Math.max(1, parseInt(e.target.value) || 0) }))}
            />
            {errors.guests && (
              <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.guests}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>💰 Budget (₹)</span>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>₹{form.budget.toLocaleString()}</span>
            </label>
            <input
              id="budget"
              type="number"
              className="form-input"
              step={1000}
              min={1000}
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: Math.max(0, parseInt(e.target.value) || 0) }))}
            />
            {errors.budget && (
              <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "8px",
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.75rem",
          }}
        >
          <span style={{ color: "#94a3b8" }}>Calculated Spend Ratio:</span>
          <span style={{ color: "#f8fafc", fontWeight: 700 }}>
            ₹{perGuest.toLocaleString()} <span style={{ color: "#64748b", fontWeight: 400 }}>/ guest</span>
          </span>
        </div>

        {/* Food Preferences */}
        <div>
          <label htmlFor="foodPreferences" className="form-label">
            🍽️ Catering & Food Style
          </label>
          <select
            id="foodPreferences"
            className="form-input"
            value={form.foodPreferences}
            onChange={(e) => setForm((f) => ({ ...f, foodPreferences: e.target.value }))}
          >
            <option value="">Select menu style…</option>
            {FOOD_PREFERENCES.map((food) => (
              <option key={food} value={food}>
                {food}
              </option>
            ))}
          </select>
          {errors.foodPreferences && (
            <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.foodPreferences}</p>
          )}
        </div>

        {/* Theme & Style */}
        <div>
          <label htmlFor="theme" className="form-label">
            ✨ Theme & Decor Vibe
          </label>
          <select
            id="theme"
            className="form-input"
            value={form.theme}
            onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
          >
            <option value="">Select celebration vibe…</option>
            {THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          {errors.theme && (
            <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "4px" }}>{errors.theme}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>📝 Specific Requests / Family Notes</span>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Optional</span>
          </label>
          <textarea
            id="notes"
            className="form-input"
            rows={2}
            placeholder="e.g. Need welcoming seating for grandparents, prefer subtle acoustic music, focus on cake cutting stage."
            value={form.additionalNotes}
            onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
            style={{ resize: "none" }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="generate-plan-btn"
          disabled={isLoading}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "0.92rem",
            fontWeight: 700,
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  animation: "spin-slow 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Architecting Your Plan…
            </>
          ) : (
            <>✨ Generate Actionable Event Plan</>
          )}
        </button>
      </div>
    </form>
  );
}
