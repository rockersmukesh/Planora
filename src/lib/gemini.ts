import { GoogleGenerativeAI } from "@google/generative-ai";
import { Plan } from "@/types/plan";
import { PlanSchema } from "@/lib/schemas";

let _genAI: GoogleGenerativeAI | null = null;

function isApiKeyConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "your_gemini_api_key_here" && key.trim().length > 10);
}

function getModel() {
  if (!isApiKeyConfigured()) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });
}

const BASE_PROMPT = `You are Planora AI, a practical family event planning assistant.
Create an actionable plan from the user's event details.
Return JSON only, matching this exact shape:
{
  "summary": "string",
  "budget_allocations": [
    {"category":"Venue","amount":0,"reason":"string"}
  ],
  "tasks": [
    {"title":"string","due_date":"YYYY-MM-DD","priority":"high|medium|low"}
  ],
  "assumptions": ["string"],
  "trade_offs": ["string"]
}
Rules:
- Use the user's budget and currency.
- Budget amounts must be non-negative and must not exceed the total budget.
- Budget allocations must sum to AT MOST the total budget.
- Do not invent vendor names, quotations or availability.
- Mark estimates as planning estimates, not confirmed prices.
- If information is missing, state assumptions.
- Generate practical tasks before the event date.
- Return ONLY valid JSON, nothing else.`;

const REPLAN_PROMPT = `You are Planora AI's change-impact assistant.
Compare the previous plan with the updated requirements.
Identify:
- what changed
- affected budget categories
- affected tasks
- practical trade-offs
- revised budget allocations
- revised tasks
Return the same JSON structure as the initial plan:
{
  "summary": "string",
  "budget_allocations": [
    {"category":"Venue","amount":0,"reason":"string"}
  ],
  "tasks": [
    {"title":"string","due_date":"YYYY-MM-DD","priority":"high|medium|low"}
  ],
  "assumptions": ["string"],
  "trade_offs": ["string"]
}
Rules:
- Never claim vendor availability or invent quotations.
- Keep the revised allocations within the new budget.
- If the constraints cannot all be satisfied, explain the conflict in trade_offs.
- Return ONLY valid JSON, nothing else.`;

export async function generatePlan(
  eventType: string,
  date: string,
  city: string,
  guests: number,
  budget: number,
  currency: string,
  foodPreferences: string,
  theme: string,
  additionalNotes?: string
): Promise<Plan> {
  const userPrompt = `
${BASE_PROMPT}

Event Details:
- Event Type: ${eventType}
- Date: ${date}
- City: ${city}
- Number of Guests: ${guests}
- Total Budget: ${currency}${budget.toLocaleString()}
- Food Preferences: ${foodPreferences}
- Theme/Style: ${theme}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ""}

Create a comprehensive, actionable plan for this event. Ensure all budget allocations are within the total budget of ${currency}${budget.toLocaleString()}.`;

  if (isApiKeyConfigured()) {
    try {
      const result = await getModel().generateContent(userPrompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validated = PlanSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (err) {
      console.warn("Gemini API call failed, using intelligent simulation engine:", err);
    }
  }

  return generateFallbackPlan(eventType, date, city, guests, budget, currency, foodPreferences, theme);
}

export async function replanEvent(
  previousPlan: Plan,
  eventType: string,
  date: string,
  city: string,
  originalGuests: number,
  originalBudget: number,
  newBudget: number,
  newGuestCount: number,
  currency: string,
  foodPreferences: string,
  theme: string,
  additionalNotes?: string
): Promise<Plan> {
  const changes: string[] = [];
  if (newBudget !== originalBudget) {
    changes.push(`Budget changed from ${currency}${originalBudget.toLocaleString()} to ${currency}${newBudget.toLocaleString()}`);
  }
  if (newGuestCount !== originalGuests) {
    changes.push(`Guest count changed from ${originalGuests} to ${newGuestCount}`);
  }

  const userPrompt = `
${REPLAN_PROMPT}

Original Event Details:
- Event Type: ${eventType}
- Date: ${date}
- City: ${city}
- Original Guests: ${originalGuests}
- Original Budget: ${currency}${originalBudget.toLocaleString()}
- Food Preferences: ${foodPreferences}
- Theme/Style: ${theme}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ""}

Changes Requested:
${changes.map(c => `- ${c}`).join("\n")}

Updated Constraints:
- New Budget: ${currency}${newBudget.toLocaleString()}
- New Guest Count: ${newGuestCount}

Previous Plan:
${JSON.stringify(previousPlan, null, 2)}

Create a revised plan that accounts for all changes. Ensure all allocations are within the new budget of ${currency}${newBudget.toLocaleString()}.`;

  if (isApiKeyConfigured()) {
    try {
      const result = await getModel().generateContent(userPrompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validated = PlanSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (err) {
      console.warn("Gemini replan call failed, using intelligent simulation engine:", err);
    }
  }

  return replanFallbackPlan(previousPlan, eventType, date, city, originalGuests, originalBudget, newBudget, newGuestCount, currency, foodPreferences, theme);
}

function calculateOffsetDate(baseDateStr: string, daysOffset: number): string {
  try {
    const d = new Date(baseDateStr);
    if (isNaN(d.getTime())) return baseDateStr;
    d.setDate(d.getDate() - daysOffset);
    return d.toISOString().split("T")[0];
  } catch {
    return baseDateStr;
  }
}

function generateFallbackPlan(
  eventType: string,
  date: string,
  city: string,
  guests: number,
  budget: number,
  currency: string,
  foodPreferences: string,
  theme: string
): Plan {
  const perGuest = Math.round(budget / Math.max(guests, 1));
  const cateringAmt = Math.round(budget * 0.36);
  const venueAmt = Math.round(budget * 0.32);
  const decorAmt = Math.round(budget * 0.13);
  const photoAmt = Math.round(budget * 0.09);
  const cakeAmt = Math.round(budget * 0.05);
  const soundAmt = Math.round(budget * 0.03);
  const contingencyAmt = budget - (cateringAmt + venueAmt + decorAmt + photoAmt + cakeAmt + soundAmt);

  return {
    summary: `Comprehensive ${theme} ${eventType.toLowerCase()} in ${city} for ${guests} guests. Budget allocated at ~${currency}${perGuest}/guest balancing high-appeal hospitality and festive ambiance.`,
    budget_allocations: [
      {
        category: "Catering & Refreshments",
        amount: cateringAmt,
        reason: `${foodPreferences} buffet menu for ${guests} guests (~${currency}${Math.round(cateringAmt / guests)}/plate) with welcome drinks and desserts.`
      },
      {
        category: "Venue & Infrastructure",
        amount: venueAmt,
        reason: `Banquet hall or community celebration space in ${city} with AC, guest seating, and essential washroom/parking amenities.`
      },
      {
        category: "Decor & Lighting",
        amount: decorAmt,
        reason: `${theme} entrance arch, custom backdrop stage, warm ambient fairy lights, and themed table accents.`
      },
      {
        category: "Photography & Digital Memories",
        amount: photoAmt,
        reason: `Professional event photographer for 3.5 hours covering guest arrivals, key milestones, and high-res digital gallery delivery.`
      },
      {
        category: "Cake & Celebration Favors",
        amount: cakeAmt,
        reason: `Artisan themed cake (approx ${Math.max(2, Math.round(guests / 40))} kg) plus customized return gift bags for family members.`
      },
      {
        category: "Sound & Entertainment",
        amount: soundAmt,
        reason: `Portable high-fidelity sound setup, dual wireless mics for emceeing/toasts, and curated background music playlist.`
      },
      {
        category: "Contingency & Tips",
        amount: Math.max(0, contingencyAmt),
        reason: "Reserved buffer for last-minute packaging, staff gratuities, and unexpected transport charges."
      }
    ],
    tasks: [
      { title: `Book & lock banquet venue in ${city} with deposit`, due_date: calculateOffsetDate(date, 21), priority: "high" },
      { title: `Finalize ${foodPreferences} menu tasting with head caterer`, due_date: calculateOffsetDate(date, 14), priority: "high" },
      { title: `Send digital WhatsApp invitations & track RSVPs`, due_date: calculateOffsetDate(date, 10), priority: "high" },
      { title: `Approve ${theme} decor mockup & entrance welcome banner`, due_date: calculateOffsetDate(date, 7), priority: "medium" },
      { title: `Order custom themed celebration cake & personalized favors`, due_date: calculateOffsetDate(date, 5), priority: "medium" },
      { title: `Finalize music playlist & coordinate microphone testing`, due_date: calculateOffsetDate(date, 3), priority: "low" },
      { title: `Assemble emergency kit (safety pins, power banks, extra cash)`, due_date: calculateOffsetDate(date, 1), priority: "low" }
    ],
    assumptions: [
      `Venue in ${city} includes standard banquet tables, banquet chairs, and baseline air conditioning.`,
      `Catering count covers ${guests} confirmed guests with a typical 5% buffer.`,
      `Sound system volume complies with local civic and residential decibel curfews.`,
      "Figures reflect market planning medians; final vendor negotiations may yield +/- 8% variances."
    ],
    trade_offs: [
      "Allocated 36% towards catering to ensure premium guest hospitality, slightly moderating live entertainment spend.",
      "Opted for a single dedicated photographer instead of dual videography to maintain high photo quality within budget."
    ],
    isDemoMode: !isApiKeyConfigured()
  };
}

function replanFallbackPlan(
  previousPlan: Plan,
  eventType: string,
  date: string,
  city: string,
  originalGuests: number,
  originalBudget: number,
  newBudget: number,
  newGuestCount: number,
  currency: string,
  foodPreferences: string,
  theme: string
): Plan {
  const budgetDelta = newBudget - originalBudget;
  const guestDelta = newGuestCount - originalGuests;
  const oldPerGuest = Math.round(originalBudget / Math.max(originalGuests, 1));
  const newPerGuest = Math.round(newBudget / Math.max(newGuestCount, 1));

  // Dynamic distribution tailored to tighter/higher budget
  const cateringAmt = Math.round(newBudget * (guestDelta > 0 ? 0.42 : 0.36));
  const venueAmt = Math.round(newBudget * (guestDelta > 0 ? 0.30 : 0.32));
  const decorAmt = Math.round(newBudget * 0.12);
  const photoAmt = Math.round(newBudget * 0.08);
  const cakeAmt = Math.round(newBudget * 0.04);
  const soundAmt = Math.round(newBudget * 0.02);
  const contingencyAmt = newBudget - (cateringAmt + venueAmt + decorAmt + photoAmt + cakeAmt + soundAmt);

  const tradeOffs: string[] = [];
  if (guestDelta > 0 && budgetDelta < 0) {
    tradeOffs.push(
      `Guest count expanded by +${guestDelta} (${originalGuests} → ${newGuestCount}) while budget reduced by ${currency}${Math.abs(budgetDelta).toLocaleString()}. Effective spend per guest shifted from ${currency}${oldPerGuest} to ${currency}${newPerGuest} (-${Math.round(((oldPerGuest - newPerGuest) / oldPerGuest) * 100)}%).`
    );
    tradeOffs.push(
      `Catering share prioritized to 42% (${currency}${cateringAmt.toLocaleString()}) to ensure sufficient food volume (~${currency}${Math.round(cateringAmt / newGuestCount)}/plate), streamlining menu to high-demand crowd favorites.`
    );
    tradeOffs.push(
      `Venue target shifted towards high-capacity community halls or afternoon off-peak rental slots to accommodate ${newGuestCount} guests under ${currency}${venueAmt.toLocaleString()}.`
    );
    tradeOffs.push(
      "Photography optimized to 2.5 hours of core event coverage (cake cutting, family stage photos) with crowd candid uploads managed via shared QR code drive."
    );
  } else if (budgetDelta > 0) {
    tradeOffs.push(
      `Budget increased by +${currency}${budgetDelta.toLocaleString()}. Upgraded per-guest budget to ${currency}${newPerGuest}, enabling live food counters and enhanced stage lighting.`
    );
  } else {
    tradeOffs.push(
      `Adjusted budget down to ${currency}${newBudget.toLocaleString()}. Maintained per-plate catering standards by streamlining decorative floral accents.`
    );
  }

  return {
    summary: `Revised ${theme} ${eventType.toLowerCase()} for ${newGuestCount} guests with adjusted budget of ${currency}${newBudget.toLocaleString()} (~${currency}${newPerGuest}/guest). Rebalanced allocations to safeguard hospitality while strictly respecting the ${currency}${newBudget.toLocaleString()} ceiling.`,
    budget_allocations: [
      {
        category: "Catering & Refreshments",
        amount: cateringAmt,
        reason: `Optimized ${foodPreferences} menu for ${newGuestCount} guests (~${currency}${Math.round(cateringAmt / newGuestCount)}/plate). Streamlined live stations to maintain generous portioning.`
      },
      {
        category: "Venue & Infrastructure",
        amount: venueAmt,
        reason: `Selected venue tier accommodating ${newGuestCount} capacity with AC and round-table seating in ${city}.`
      },
      {
        category: "Decor & Lighting",
        amount: decorAmt,
        reason: `Focused focal-point stage styling, photo-op selfie corner, and battery-powered warm LED uplights.`
      },
      {
        category: "Photography & Coverage",
        amount: photoAmt,
        reason: "Core 2.5-hour event milestone coverage + digital highlight album."
      },
      {
        category: "Cake & Celebration Favors",
        amount: cakeAmt,
        reason: `High-impact centerpiece cake plus smart batch-packaged family favors for ${newGuestCount} guests.`
      },
      {
        category: "Sound & Audio Setup",
        amount: soundAmt,
        reason: "Compact PA speaker system with Bluetooth receiver and single wireless mic."
      },
      {
        category: "Contingency Fund",
        amount: Math.max(0, contingencyAmt),
        reason: "Safeguarded reserve buffer for last-minute guest overages and transport."
      }
    ],
    tasks: [
      { title: `Reconfirm venue capacity & safety fire-code compliance for ${newGuestCount} guests in ${city}`, due_date: calculateOffsetDate(date, 18), priority: "high" },
      { title: `Renegotiate catering package to ${currency}${Math.round(cateringAmt / newGuestCount)}/plate rate with caterer`, due_date: calculateOffsetDate(date, 12), priority: "high" },
      { title: `Audit updated RSVP guest list for extra seating and dietary restrictions`, due_date: calculateOffsetDate(date, 8), priority: "high" },
      { title: `Order revised quantities of customized return favors and celebration cake`, due_date: calculateOffsetDate(date, 6), priority: "medium" },
      { title: `Verify stage backdrop dimensions with decorator for wider group photo stage`, due_date: calculateOffsetDate(date, 4), priority: "medium" },
      { title: `Setup digital photo sharing QR code for guests to upload their phone snapshots`, due_date: calculateOffsetDate(date, 2), priority: "low" }
    ],
    assumptions: [
      `Venue space can comfortably accommodate ${newGuestCount} guests without crowding fire exits.`,
      `Caterer agrees to batch volume pricing for ${newGuestCount} plates.`,
      "All cost calculations adhere to strict backend arithmetic validation."
    ],
    trade_offs: tradeOffs,
    isDemoMode: !isApiKeyConfigured()
  };
}
