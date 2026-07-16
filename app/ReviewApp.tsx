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
  name: "Lucas Campos",
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
  settings: "settings",
};

const migratedState = (): PlannerState => {
  const state = emptyState();
  const now = new Date().toISOString();
  state.categories = defaultCategories;
  state.accounts = [
    {
      id: "review-account",
      name: "Conta migrada",
      type: "digital",
      initialBalanceCents: 245000,
      color: "#F8BF4D",
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.cards = [
    {
      id: "review-card",
      name: "Cartão Colmeia",
      limitCents: 420000,
      closingDay: 18,
      dueDay: 25,
      paymentAccountId: "review-account",
      color: "#231F20",
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.transactions = [
    {
      id: "review-income",
      type: "income",
      description: "Salário",
      amountCents: 480000,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "salario",
      accountId: "review-account",
      tags: [],
      recurrence: "monthly",
      status: "paid",
      demo: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "review-transaction",
      type: "expense",
      description: "Mercado",
      amountCents: 18240,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "alimentacao",
      accountId: "review-account",
      tags: [],
      recurrence: "none",
      status: "paid",
      demo: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.budgets = [
    {
      id: "review-budget",
      categoryId: "alimentacao",
      month: new Date().toISOString().slice(0, 7),
      limitCents: 80000,
      createdAt: now,
      updatedAt: now,
    },
  ];
  state.goals = [
    {
      id: "review-goal",
      name: "Reserva de emergência",
      targetCents: 1200000,
      currentCents: 285000,
      targetDate: `${new Date().getFullYear() + 1}-12-31`,
      accountId: "review-account",
      color: "#F8BF4D",
      icon: "target",
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
  const repository = useMemo(
    () =>
      new MemoryPlannerRepository(
        query in reviewNav && query !== "empty"
          ? migratedState()
          : { ...emptyState(), categories: defaultCategories },
      ),
    [query],
  );
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
