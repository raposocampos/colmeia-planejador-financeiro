export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "paid" | "pending";
export type Recurrence = "none" | "weekly" | "monthly" | "yearly";
export type NavKey =
  | "dashboard"
  | "transactions"
  | "accounts"
  | "budgets"
  | "goals"
  | "reports"
  | "settings";

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account extends BaseRecord {
  name: string;
  type: "checking" | "digital" | "savings" | "wallet" | "cash" | "investment" | "other";
  institution?: string;
  initialBalanceCents: number;
  color: string;
  archived: boolean;
}

export interface CreditCard extends BaseRecord {
  name: string;
  limitCents: number;
  closingDay: number;
  dueDay: number;
  paymentAccountId?: string;
  color: string;
  archived: boolean;
}

export interface Category extends BaseRecord {
  name: string;
  kind: "income" | "expense" | "both";
  color: string;
  icon: string;
  archived: boolean;
}

export interface Transaction extends BaseRecord {
  type: TransactionType;
  description: string;
  amountCents: number;
  date: string;
  categoryId?: string;
  accountId?: string;
  destinationAccountId?: string;
  creditCardId?: string;
  paymentMethod?: string;
  notes?: string;
  tags: string[];
  recurrence: Recurrence;
  status: TransactionStatus;
  demo: boolean;
}

export interface Budget extends BaseRecord {
  categoryId: string;
  month: string;
  limitCents: number;
}

export interface Goal extends BaseRecord {
  name: string;
  targetCents: number;
  currentCents: number;
  targetDate?: string;
  accountId?: string;
  color: string;
  icon: string;
}

export interface AppSettings {
  id: "settings";
  onboardingComplete: boolean;
  demoLoaded: boolean;
  currency: "BRL";
  locale: "pt-BR";
  timezone: string;
  version: 1;
  updatedAt: string;
}

export interface PlannerState {
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  settings: AppSettings;
}

export interface BackupMetadata {
  app: "colmeia-educacao-financeira";
  version: 1;
  exportedAt: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: PlannerState;
}

export const initialSettings = (): AppSettings => ({
  id: "settings",
  onboardingComplete: false,
  demoLoaded: false,
  currency: "BRL",
  locale: "pt-BR",
  timezone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Sao_Paulo",
  version: 1,
  updatedAt: new Date().toISOString(),
});

export const emptyState = (): PlannerState => ({
  accounts: [],
  cards: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  settings: initialSettings(),
});
