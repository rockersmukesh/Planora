import { z } from "zod";

export const BudgetAllocationSchema = z.object({
  category: z.string().min(1),
  amount: z.number().nonnegative(),
  reason: z.string().min(1),
});

export const TaskSchema = z.object({
  title: z.string().min(1),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  priority: z.enum(["high", "medium", "low"]),
});

export const PlanSchema = z.object({
  summary: z.string().min(1),
  budget_allocations: z.array(BudgetAllocationSchema).min(1),
  tasks: z.array(TaskSchema).min(1),
  assumptions: z.array(z.string()),
  trade_offs: z.array(z.string()),
});

export const EventFormSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  city: z.string().min(1, "City is required"),
  guests: z.number().int().positive("Guest count must be positive"),
  budget: z.number().positive("Budget must be positive"),
  currency: z.string().min(1, "Currency is required"),
  foodPreferences: z.string().min(1, "Food preferences are required"),
  theme: z.string().min(1, "Theme is required"),
  additionalNotes: z.string().optional(),
});

export const ReplanRequestSchema = z.object({
  previousPlan: PlanSchema,
  eventData: EventFormSchema,
  newBudget: z.number().positive(),
  newGuestCount: z.number().int().positive(),
});
