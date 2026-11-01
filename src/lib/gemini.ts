import { GoogleGenerativeAI } from "@google/generative-ai";
import { Plan } from "@/types/plan";
import { PlanSchema } from "@/lib/schemas";

let _genAI: GoogleGenerativeAI | null = null;

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

  const result = await getModel().generateContent(userPrompt);
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 200)}`);
  }

  const validated = PlanSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI response validation failed: ${validated.error.message}`);
  }

  return validated.data;
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

  const result = await getModel().generateContent(userPrompt);
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text.slice(0, 200)}`);
  }

  const validated = PlanSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI response validation failed: ${validated.error.message}`);
  }

  return validated.data;
}
