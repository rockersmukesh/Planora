# Planora AI – README

<div align="center">
  <h1>🎯 Planora AI</h1>
  <p><strong>AI-Powered Family Event Planner</strong></p>
  <p><em>Plan Smarter. Celebrate Better.</em></p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
  ![Gemini AI](https://img.shields.io/badge/Gemini-1.5_Flash-orange?style=flat-square&logo=google)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
</div>

---

## 🏆 Chosen Vertical

**Family Celebration Planning** – Helping families and individuals plan events like birthdays, weddings, anniversaries, and more with AI-generated budgets, task checklists, and smart replanning.

---

## 🚀 Live Demo

> **Deployed URL:** [Add Vercel URL here after deployment]

---

## 📋 What It Does

Planora AI is a single-page web application that:

1. **Collects Event Details** – Event type, date, city, guests, budget, currency, food preferences, and theme
2. **Generates AI Plans** – Uses Gemini 1.5 Flash to create a structured event plan with:
   - Budget allocation across categories (Venue, Catering, Decoration, etc.)
   - Task checklist with due dates and priorities (High/Medium/Low)
   - Planning assumptions and trade-off analysis
3. **Smart Replanning** – Adjust budget or guest count and get a revised plan that:
   - Identifies impacted budget categories
   - Highlights catering/venue concerns when guests increase
   - Proposes practical trade-offs when budget is reduced
4. **Plan History** – Preserves all versions for comparison

---

## 🔧 Approach & Logic

### AI Workflow (2 API Calls)

**Call 1 – Initial Plan** (`POST /api/plan`):
```
Event details → Gemini prompt → Structured JSON plan
```

**Call 2 – Replan** (`POST /api/replan`):
```
Previous plan + changes → Gemini change-impact prompt → Revised JSON plan
```

### Backend as Source of Truth

Budget arithmetic is always calculated server-side in TypeScript:
- Validates all allocations are non-negative
- Confirms totals don't exceed the user's budget
- Auto-normalizes if Gemini returns over-budget amounts

### Data Validation

All inputs are validated using **Zod schemas** before sending to Gemini. All Gemini responses are validated before sending to the client.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main single-page dashboard
│   ├── layout.tsx            # Root layout with SEO metadata
│   ├── globals.css           # Global dark theme styles
│   └── api/
│       ├── plan/route.ts     # POST /api/plan – Generate initial plan
│       └── replan/route.ts   # POST /api/replan – Generate revised plan
├── components/
│   ├── EventForm.tsx         # Event input form with validation
│   ├── PlanResults.tsx       # Plan display (summary, budget, tasks)
│   ├── BudgetBreakdown.tsx   # Budget visualization with progress bars
│   ├── TaskList.tsx          # Interactive task checklist with filters
│   └── ReplanPanel.tsx       # Replan controls and change indicators
├── lib/
│   ├── gemini.ts             # Gemini AI client with prompts
│   ├── schemas.ts            # Zod validation schemas
│   └── budget.ts             # Budget calculation utilities
└── types/
    └── plan.ts               # TypeScript type definitions
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| AI | Google Gemini 1.5 Flash |
| Styling | Tailwind CSS 4 + Custom CSS |
| Validation | Zod |
| Deployment | Vercel |

---

## 🔒 Security

- **API keys are server-side only** – `GEMINI_API_KEY` lives in `.env.local` and is never exposed to the browser
- `.env.local` is in `.gitignore` – key is never committed to Git
- All user inputs are validated with Zod before processing
- AI responses are validated and sanitized before returning to client
- Budget arithmetic is computed on the server, never trusted from AI output

---

## 📐 Assumptions Made

1. Budget currency supports INR, USD, EUR, GBP, AUD, SGD, and AED
2. The app uses in-browser state for plan history (no database required for MVP)
3. All budget figures from Gemini are planning estimates, not confirmed prices
4. Tasks are relative to the event date; past dates are flagged as overdue
5. Guest counts up to 10,000 are supported
6. Minimum budget is 1,000 in the chosen currency

---

## 🧪 Test Checklist

- [x] Create a birthday event with ₹50,000 and 100 guests
- [x] Generate and display initial plan with budget breakdown
- [x] Confirm allocation totals do not exceed ₹50,000
- [x] Change budget to ₹40,000 and guests to 130
- [x] Confirm revised plan explains affected categories and trade-offs
- [x] Invalid AI output produces a useful error message
- [x] API key is NOT present in browser code or Git history
- [x] Form validation prevents submission with missing/invalid data

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd planora-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key
echo "GEMINI_API_KEY=your_actual_key_here" >> .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment (Vercel)

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variable: `GEMINI_API_KEY` = your key
4. Deploy and test the production URL

---

## 🎬 Demo Scenario

**Initial Input:**
- Birthday celebration in Mumbai
- 100 guests
- ₹50,000 budget
- Vegetarian food
- Elegant & Classic theme

**Show:** AI-generated budget allocation, task checklist with priorities, and planning assumptions

**Change:** Budget → ₹40,000 | Guests → 130

**Result:** Planora AI identifies catering/venue impact, proposes trade-offs, validates the new budget, and presents a revised plan while preserving the original for comparison.

---

## 📊 Evaluation Focus

| Area | Implementation |
|------|---------------|
| **Code Quality** | TypeScript, component architecture, separation of concerns |
| **Security** | Server-side API keys, Zod validation, no client secrets |
| **Efficiency** | Minimal Gemini calls (2 max), server-side budget arithmetic |
| **Testing** | Input validation, AI response validation, error boundaries |
| **Accessibility** | Semantic HTML, ARIA roles, keyboard navigation, unique IDs |
| **Problem Alignment** | Complete create → generate → replan → compare journey |

---

*Built for the Planora AI 2-Hour Hackathon MVP Challenge*
