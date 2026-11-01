import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/gemini";
import { normalizeBudgetAllocations, validateBudgetAllocations } from "@/lib/budget";
import { EventFormSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = EventFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { eventType, date, city, guests, budget, currency, foodPreferences, theme, additionalNotes } = parsed.data;

    // Generate plan using Gemini
    const plan = await generatePlan(
      eventType,
      date,
      city,
      guests,
      budget,
      currency,
      foodPreferences,
      theme,
      additionalNotes
    );

    // Backend validation - ensure budget is not exceeded (source of truth)
    const validation = validateBudgetAllocations(plan.budget_allocations, budget);
    if (!validation.valid) {
      // Normalize allocations to fit within budget
      plan.budget_allocations = normalizeBudgetAllocations(plan.budget_allocations, budget);
    }

    // Add timestamp
    const planWithMeta = {
      ...plan,
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, plan: planWithMeta });
  } catch (error) {
    console.error("Plan generation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("GEMINI_API_KEY")) {
        return NextResponse.json(
          { error: "API configuration error. Please check server configuration." },
          { status: 500 }
        );
      }
      if (error.message.includes("parse") || error.message.includes("validation")) {
        return NextResponse.json(
          { error: "AI returned an unexpected response format. Please try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate plan. Please try again." },
      { status: 500 }
    );
  }
}
