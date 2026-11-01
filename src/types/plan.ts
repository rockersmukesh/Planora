export interface BudgetAllocation {
  category: string;
  amount: number;
  reason: string;
}

export interface Task {
  title: string;
  due_date: string;
  priority: "high" | "medium" | "low";
}

export interface Plan {
  id?: string;
  summary: string;
  budget_allocations: BudgetAllocation[];
  tasks: Task[];
  assumptions: string[];
  trade_offs: string[];
  createdAt?: string;
  isDemoMode?: boolean;
}

export interface EventFormData {
  eventType: string;
  date: string;
  city: string;
  guests: number;
  budget: number;
  currency: string;
  foodPreferences: string;
  theme: string;
  additionalNotes?: string;
}

export interface ReplanRequest {
  previousPlan: Plan;
  eventData: EventFormData;
  newBudget: number;
  newGuestCount: number;
}

export interface PlanHistory {
  version: number;
  label: string;
  plan: Plan;
  eventData: EventFormData;
  changes?: string;
  timestamp: string;
}
