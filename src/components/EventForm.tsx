"use client";

import { useState, useEffect } from "react";
import { EventFormData } from "@/types/plan";

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isLoading: boolean;
}

const EVENT_TYPES = [
  "Birthday Celebration",
  "Wedding",
  "Anniversary",
  "Baby Shower",
  "Graduation Party",
  "Corporate Event",
  "Engagement Party",
  "Farewell Party",
  "House Warming",
  "Festival Celebration",
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
];

const FOOD_OPTIONS = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Jain",
  "Mixed (Veg + Non-Veg)",
  "South Indian",
  "North Indian",
  "Continental",
  "Pan-Asian",
  "Mediterranean",
];

const THEME_OPTIONS = [
  "Elegant & Classic",
  "Modern Minimalist",
  "Royal & Luxurious",
  "Rustic & Bohemian",
  "Floral & Garden",
  "Bollywood & Glamour",
  "Tropical Paradise",
  "Black & Gold",
  "Pastel Dreams",
  "Vintage & Retro",
  "Outdoor Adventure",
  "Disney / Fantasy",
];

export default function EventForm({ onSubmit, isLoading }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    eventType: "",
    date: "",
    city: "",
    guests: 50,
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

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    if (!form.eventType) newErrors.eventType = "Please select an event type";
    if (!form.date) newErrors.date = "Please select a date";
    if (!form.city.trim()) newErrors.city = "Please enter a city";
    if (form.guests < 1) newErrors.guests = "At least 1 guest required";
    if (form.guests > 10000) newErrors.guests = "Maximum 10,000 guests";
    if (form.budget < 1000) newErrors.budget = "Minimum budget is 1,000";
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

  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "grid", gap: "20px" }}>
        {/* Event Type */}
        <div>
          <label htmlFor="eventType" className="form-label">
            🎉 Event Type
          </label>
          <select
            id="eventType"
            className="form-input"
            value={form.eventType}
            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
          >
            <option value="">Select event type…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
              {errors.eventType}
            </p>
          )}
        </div>

        {/* Date & City */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
              <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.date}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="city" className="form-label">
              📍 City
            </label>
            <input
              id="city"
              type="text"
              className="form-input"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            {errors.city && (
              <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
                {errors.city}
              </p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div>
          <label htmlFor="guests" className="form-label">
            👥 Number of Guests
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              id="guests"
              type="number"
              className="form-input"
              min={1}
              max={10000}
              value={form.guests}
              onChange={(e) =>
                setForm((f) => ({ ...f, guests: parseInt(e.target.value) || 0 }))
              }
            />
            <span
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                whiteSpace: "nowrap",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              {form.guests} guests
            </span>
          </div>
          {errors.guests && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
              {errors.guests}
            </p>
          )}
        </div>

        {/* Budget & Currency */}
        <div>
          <label className="form-label">💰 Budget</label>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px" }}>
            <select
              id="currency"
              className="form-input"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <input
              id="budget"
              type="number"
              className="form-input"
              min={1000}
              step={1000}
              value={form.budget}
              onChange={(e) =>
                setForm((f) => ({ ...f, budget: parseFloat(e.target.value) || 0 }))
              }
              placeholder="50000"
            />
          </div>
          {form.budget > 0 && (
            <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "6px" }}>
              Per guest: {selectedCurrency?.symbol}
              {Math.round(form.budget / Math.max(form.guests, 1)).toLocaleString("en-IN")}
            </p>
          )}
          {errors.budget && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
              {errors.budget}
            </p>
          )}
        </div>

        {/* Food Preferences */}
        <div>
          <label htmlFor="food" className="form-label">
            🍽️ Food Preferences
          </label>
          <select
            id="food"
            className="form-input"
            value={form.foodPreferences}
            onChange={(e) => setForm((f) => ({ ...f, foodPreferences: e.target.value }))}
          >
            <option value="">Select food preferences…</option>
            {FOOD_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.foodPreferences && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
              {errors.foodPreferences}
            </p>
          )}
        </div>

        {/* Theme */}
        <div>
          <label htmlFor="theme" className="form-label">
            ✨ Theme / Style
          </label>
          <select
            id="theme"
            className="form-input"
            value={form.theme}
            onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
          >
            <option value="">Select a theme…</option>
            {THEME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.theme && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
              {errors.theme}
            </p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="form-label">
            📝 Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="form-input"
            rows={3}
            placeholder="Any special requirements, dietary restrictions, specific vendors you prefer…"
            value={form.additionalNotes}
            onChange={(e) =>
              setForm((f) => ({ ...f, additionalNotes: e.target.value }))
            }
            style={{ resize: "vertical", minHeight: "80px" }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          id="generate-plan-btn"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {isLoading ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin-slow 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Generating Your Plan…
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Generate AI Plan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
