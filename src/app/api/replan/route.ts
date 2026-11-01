import { NextRequest, NextResponse } from "next/server";
import { replanEvent } from "@/lib/gemini";
import { normalizeBudgetAllocations, validateBudgetAllocations } from "@/lib/budget";
import { ReplanRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = ReplanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { previousPlan, eventData, newBudget, newGuestCount } = parsed.data;

    // Flag issues for the frontend
    const warnings: string[] = [];
    if (newGuestCount > eventData.guests) {
      warnings.push("Guest count increased — review catering and venue capacity.");
    }
    if (newBudget < eventData.budget) {
      warnings.push("Budget reduced — some categories may need to be adjusted.");
    }

    // Generate revised plan using Gemini
    const revisedPlan = await replanEvent(
      previousPlan,
      eventData.eventType,
      eventData.date,
      eventData.city,
      eventData.guests,
      eventData.budget,
      newBudget,
      newGuestCount,
      eventData.currency,
      eventData.foodPreferences,
      eventData.theme,
      eventData.additionalNotes
    );

    // Backend validation - calculate in TypeScript, not trust Gemini
    const validation = validateBudgetAllocations(revisedPlan.budget_allocations, newBudget);
    if (!validation.valid) {
      revisedPlan.budget_allocations = normalizeBudgetAllocations(revisedPlan.budget_allocations, newBudget);
    }

    // Add timestamp
    const revisedPlanWithMeta = {
      ...revisedPlan,
      id: `replan_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      plan: revisedPlanWithMeta,
      warnings,
      changes: {
        budgetChanged: newBudget !== eventData.budget,
        guestCountChanged: newGuestCount !== eventData.guests,
        oldBudget: eventData.budget,
        newBudget,
        oldGuestCount: eventData.guests,
        newGuestCount,
      },
    });
  } catch (error) {
    console.error("Replan error:", error);

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
      { error: "Failed to generate revised plan. Please try again." },
      { status: 500 }
    );
  }
}
