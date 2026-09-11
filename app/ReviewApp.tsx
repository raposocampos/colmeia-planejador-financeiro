"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import PlannerApp from "./PlannerApp";
import { AuthScreen } from "./components/AuthScreen";
import { MigrationDialog } from "./components/MigrationDialog";
import { Onboarding } from "./components/Onboarding";
import { defaultCategories } from "./lib/demo";
import { configurePlannerRepository } from "./lib/plannerGateway";
import { MemoryPlannerRepository } from "./lib/repositories/memory";
import { emptyState, type PlannerState } from "./lib/types";
import type { NavKey } from "./lib/types";
import type { AppUserProfile } from "./lib/profile";

const profile: AppUserProfile = {
  id: "review-user",
  name: "Lucas",
  email: "lucas.exemplo@colmeia.test",
  emailConfirmed: true,
  providers: ["email", "google"],
  createdAt: "2026-07-16T12:00:00.000Z",
  onboardingCompletedAt: "2026-07-16T12:10:00.000Z",
};

const reviewNav: Partial<Record<string, NavKey>> = {
  empty: "dashboard",
  migrated: "dashboard",
  transactions: "transactions",
  accounts: "accounts",
  budgets: "budgets",
  reports: "reports",
  settings: "settings",
};

const migratedState = (): PlannerState => {
  const state = emptyState();
  const now = new Date().toISOString();
  const month = new Date().toISOString().slice(0, 7);
  const day = (value: number) => `${month}-${String(value).padStart(2, "0")}`;
  state.categories = [
    ...defaultCategories,
    {
      id: "carro",
      name: "Carro",
      kind: "expense",
      color: "#F5B942",
      icon: "carro",
      archived: false,
      sortOrder: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "conjuge",
      name: "Cônjuge",
      kind: "expense",
      color: "#C6BBA5",
      icon: "coração",
      archived: false,
      sortOrder: 21,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.accounts = [
    ["review-account-main", "Conta principal", "digital", 600000, "#F8BF4D"],
    ["review-account-savings", "Reserva", "savings", 500000, "#D9A52F"],
    ["review-account-wallet", "Carteira", "wallet", 400000, "#FFE161"],
    ["review-account-investment", "Investimentos", "investment", 131560, "#5A7348"],
  ].map(([id, name, type, initialBalanceCents, color]) => ({
    id: String(id),
    name: String(name),
    type: type as PlannerState["accounts"][number]["type"],
    initialBalanceCents: Number(initialBalanceCents),
    color: String(color),
    archived: false,
    createdAt: now,
    updatedAt: now,
  }));
  state.cards = [
    {
      id: "review-card",
      name: "Cartão Colmeia",
      limitCents: 500000,
      closingDay: 18,
      dueDay: 25,
      paymentAccountId: "review-account-main",
      color: "#231F20",
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
  const rows: Array<
    ["income" | "expense", string, number, number, string, "paid" | "pending"]
  > = [
    ["expense", "Abastecimento", 32000, 10, "carro", "paid"],
    ["expense", "Supermercado Extra", 14320, 9, "alimentacao", "paid"],
    ["income", "Transferência recebida", 58941, 8, "renda-extra", "paid"],
    ["expense", "Fatura cartão", 200000, 7, "conjuge", "paid"],
    ["expense", "Farmácia", 8750, 6, "saude", "paid"],
    ["expense", "Financiamento veículo", 1300000, 5, "carro", "paid"],
    ["expense", "Seguro do carro", 167702, 5, "carro", "paid"],
    ["expense", "Empréstimo", 20000, 5, "dividas", "paid"],
    ["expense", "Parcela renegociada", 12000, 4, "dividas", "paid"],
    ["expense", "Juros", 9572, 4, "dividas", "paid"],
    ["expense", "Feira", 8950, 4, "alimentacao", "paid"],
    ["expense", "Padaria", 9620, 4, "alimentacao", "paid"],
    ["expense", "Condomínio", 10000, 4, "moradia", "paid"],
    ["expense", "Energia", 9590, 3, "moradia", "paid"],
    ["expense", "Internet", 7000, 3, "moradia", "paid"],
    ["expense", "Consulta", 1590, 3, "saude", "paid"],
    ["expense", "Papelaria", 500, 3, "outros", "paid"],
    ["expense", "Café", 430, 3, "outros", "paid"],
    ["expense", "Estacionamento", 380, 2, "outros", "paid"],
    ["expense", "Tarifa", 350, 2, "outros", "paid"],
    ["expense", "Presente", 520, 2, "outros", "paid"],
    ["expense", "Lavanderia", 460, 2, "outros", "paid"],
    ["expense", "Chaveiro", 415, 1, "outros", "paid"],
    ["expense", "Água", 390, 1, "outros", "paid"],
    ["expense", "Correios", 390, 1, "outros", "paid"],
    ["expense", "Ajuste do mês", 881, 1, "outros", "paid"],
    ["expense", "Doação", 0, 1, "outros", "paid"],
  ];
  state.transactions = rows.map(
    ([type, description, amountCents, date, categoryId, status], index) => ({
      id: `review-transaction-${index}`,
      type,
      description,
      amountCents,
      date: day(date),
      categoryId,
      accountId: "review-account-main",
      creditCardId: description === "Fatura cartão" ? "review-card" : undefined,
      paymentMethod: description === "Fatura cartão" ? "Crédito" : "Conta",
      tags: [],
      recurrence: "none",
      status,
      demo: true,
      createdAt: now,
      updatedAt: now,
    }),
  );
  state.transactions.push({
    id: "review-upcoming-insurance",
    type: "expense",
    description: "Seguro Cartão",
    amountCents: 990,
    date: day(6),
    categoryId: "outros",
    accountId: "review-account-main",
    tags: ["recorrente"],
    recurrence: "monthly",
    status: "pending",
    demo: true,
    createdAt: now,
    updatedAt: now,
  });
  state.budgets = [
    {
      id: "review-budget-home",
      categoryId: "moradia",
      month,
      limitCents: 80000,
      durationMonths: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "review-budget-food",
      categoryId: "alimentacao",
      month,
      limitCents: 60000,
      durationMonths: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.goals = [
    {
      id: "review-goal",
      name: "Reserva de emergência",
      targetCents: 1500000,
      currentCents: 465000,
      targetDate: `${new Date().getFullYear() + 1}-12-31`,
      accountId: "review-account-savings",
      color: "#F8BF4D",
      icon: "escudo",
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.settings.onboardingComplete = true;
  return state;
};

export default function ReviewApp() {
  const query = useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("review") ?? "flow",
    () => "login",
  );
  const [stage, setStage] = useState<"auth" | "onboarding" | "ready">("auth");
  const storedStage = useSyncExternalStore(
    () => () => undefined,
    () => {
      if (query !== "flow") return "auth";
      const signedIn = Boolean(
        window.localStorage.getItem("colmeia-review-session") ||
        window.sessionStorage.getItem("colmeia-review-session"),
      );
      if (!signedIn) return "auth";
      return window.localStorage.getItem("colmeia-review-onboarding")
        ? "ready"
        : "onboarding";
    },
    () => "auth",
  );
  const currentStage = stage === "auth" ? storedStage : stage;
  const repository = useMemo(() => {
    if (!(query in reviewNav) || query === "empty")
      return new MemoryPlannerRepository({
        ...emptyState(),
        categories: defaultCategories,
      });

    const state = migratedState();
    if (query !== "migrated") {
      const defaultCategoryIds = new Set(
        defaultCategories.map((category) => category.id),
      );
      state.categories = defaultCategories;
      state.transactions = state.transactions.filter((transaction) =>
        defaultCategoryIds.has(transaction.categoryId ?? ""),
      );
      state.budgets = state.budgets.filter((budget) => budget.categoryId !== "moradia");
    }
    return new MemoryPlannerRepository(state);
  }, [query]);
  configurePlannerRepository(repository);
  const signIn = () => setStage("onboarding");
  if (query === "login" && currentStage === "auth")
    return <AuthScreen initialMode="login" reviewOnAuthenticated={signIn} />;
  if (query === "signup" && currentStage === "auth")
    return <AuthScreen initialMode="signup" reviewOnAuthenticated={signIn} />;
  if (query === "onboarding")
    return <Onboarding onFinish={() => undefined} onSkip={() => undefined} />;
  if (query === "migration")
    return (
      <MigrationDialog
        counts={{
          accounts: 2,
          cards: 1,
          transactions: 48,
          budgets: 3,
          goals: 2,
          customCategories: 1,
        }}
        remoteHasData={false}
        onBackup={() => undefined}
        onImport={async () => undefined}
        onUseCloud={() => undefined}
        onCancel={() => undefined}
      />
    );
  if (query === "migration-conflict")
    return (
      <MigrationDialog
        counts={{
          accounts: 2,
          cards: 1,
          transactions: 48,
          budgets: 3,
          goals: 2,
          customCategories: 1,
        }}
        remoteHasData
        onBackup={() => undefined}
        onImport={async () => undefined}
        onUseCloud={() => undefined}
        onCancel={() => undefined}
      />
    );
  if (query === "profile" || query in reviewNav)
    return (
      <PlannerApp
        profile={profile}
        online
        onSignOut={async () => undefined}
        onReplayTour={() => undefined}
        onDeleteAccount={async () => undefined}
        initialNav={
          query === "profile" ? "settings" : (reviewNav[query] ?? "dashboard")
        }
      />
    );
  if (currentStage === "auth")
    return <AuthScreen initialMode="signup" reviewOnAuthenticated={signIn} />;
  if (currentStage === "onboarding")
    return (
      <Onboarding
        onFinish={() => {
          window.localStorage.setItem("colmeia-review-onboarding", "true");
          setStage("ready");
        }}
      />
    );
  return (
    <PlannerApp
      profile={profile}
      online
      onSignOut={async () => {
        window.localStorage.removeItem("colmeia-review-session");
        window.sessionStorage.removeItem("colmeia-review-session");
        setStage("auth");
      }}
      onReplayTour={() => setStage("onboarding")}
      onDeleteAccount={async () => setStage("auth")}
    />
  );
}
