import { BudgetAllocation } from "@/types/plan";

/**
 * Validates that all budget allocations are non-negative
 * and that the total does not exceed the given budget.
 */
export function validateBudgetAllocations(
  allocations: BudgetAllocation[],
  totalBudget: number
): { valid: boolean; errors: string[]; total: number } {
  const errors: string[] = [];
  let total = 0;

  for (const allocation of allocations) {
    if (allocation.amount < 0) {
      errors.push(
        `Allocation for "${allocation.category}" has a negative amount: ${allocation.amount}`
      );
    }
    total += allocation.amount;
  }

  if (total > totalBudget) {
    errors.push(
      `Total allocations (${total.toFixed(2)}) exceed the budget (${totalBudget.toFixed(2)}) by ${(total - totalBudget).toFixed(2)}`
    );
  }

  return { valid: errors.length === 0, errors, total };
}

/**
 * Normalizes budget allocations to fit within the total budget.
 * If allocations exceed the budget, scales them proportionally.
 */
export function normalizeBudgetAllocations(
  allocations: BudgetAllocation[],
  totalBudget: number
): BudgetAllocation[] {
  const total = allocations.reduce((sum, a) => sum + a.amount, 0);
  if (total <= totalBudget || total === 0) return allocations;

  const scale = totalBudget / total;
  return allocations.map((a) => ({
    ...a,
    amount: Math.floor(a.amount * scale),
  }));
}

/**
 * Formats currency with proper locale formatting.
 */
export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
    SGD: "S$",
    AED: "AED",
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

/**
 * Calculates the remaining budget after allocations.
 */
export function getRemainingBudget(
  allocations: BudgetAllocation[],
  totalBudget: number
): number {
  const total = allocations.reduce((sum, a) => sum + a.amount, 0);
  return totalBudget - total;
}

/**
 * Gets the percentage of budget used by each allocation.
 */
export function getBudgetPercentage(
  amount: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return Math.round((amount / totalBudget) * 100);
}

/**
 * Groups tasks by priority for display.
 */
export function getTasksByPriority(tasks: { title: string; due_date: string; priority: string }[]) {
  return {
    high: tasks.filter((t) => t.priority === "high"),
    medium: tasks.filter((t) => t.priority === "medium"),
    low: tasks.filter((t) => t.priority === "low"),
  };
}
