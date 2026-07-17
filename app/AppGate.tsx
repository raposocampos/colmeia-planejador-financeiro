"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import PlannerApp from "./PlannerApp";
import { AuthScreen, type AuthMode } from "./components/AuthScreen";
import { BrandMark } from "./components/BrandMark";
import { MigrationDialog } from "./components/MigrationDialog";
import { Onboarding } from "./components/Onboarding";
import { createBackup } from "./lib/backup";
import { LocalPlannerRepository } from "./lib/repositories/local";
import { SupabasePlannerRepository } from "./lib/repositories/supabase";
import { configurePlannerRepository } from "./lib/plannerGateway";
import {
  clearAuthenticationStorage,
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "./lib/supabase";
import {
  compareMigrationCounts,
  countLegacyData,
  hasLegacyData,
  hasRemoteFinancialData,
  migrationIdForState,
  sanitizeLegacyState,
  validatePlannerReferences,
} from "./lib/migration";
import type { PlannerState } from "./lib/types";
import type { AppUserProfile } from "./lib/profile";
import ReviewApp from "./ReviewApp";

type GateState =
  | "booting"
  | "signed-out"
  | "confirm-email"
  | "migration"
  | "onboarding"
  | "ready"
  | "error";

const downloadBackup = (state: PlannerState): void => {
  const blob = new Blob([JSON.stringify(createBackup(state), null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `colmeia-backup-local-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
};

const profileFromUser = (user: User, row: Record<string, unknown>): AppUserProfile => ({
  id: user.id,
  name: String(
    row.name || user.user_metadata.name || user.email?.split("@")[0] || "Pessoa",
  ),
  email: user.email ?? "",
  emailConfirmed: Boolean(user.email_confirmed_at),
  providers: Array.isArray(user.app_metadata.providers)
    ? user.app_metadata.providers.map(String)
    : [String(user.app_metadata.provider ?? "email")],
  createdAt: user.created_at,
  onboardingCompletedAt: row.onboarding_completed_at
    ? String(row.onboarding_completed_at)
    : null,
});

export default function AppGate() {
  if (process.env.NEXT_PUBLIC_REVIEW_MODE === "true") return <ReviewApp />;
  return <CloudAppGate />;
}

function CloudAppGate() {
  const configured = isSupabaseConfigured();
  const [gate, setGate] = useState<GateState>(configured ? "booting" : "error");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [repository, setRepository] = useState<SupabasePlannerRepository | null>(null);
  const [legacyState, setLegacyState] = useState<PlannerState | null>(null);
  const [remoteHasData, setRemoteHasData] = useState(false);
  const [error, setError] = useState(
    configured
      ? ""
      : "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para revisar a V2.",
  );
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [replayTour, setReplayTour] = useState(false);
  const routeAuthMode = useSyncExternalStore(
    () => () => undefined,
    () => {
      if (window.location.pathname.includes("reset-password")) return "reset";
      if (new URLSearchParams(window.location.search).has("error")) return "error";
      return "login";
    },
    () => "login",
  ) as AuthMode;
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  const continueAfterMigration = useCallback(
    (nextProfile: AppUserProfile, nextRepository: SupabasePlannerRepository) => {
      configurePlannerRepository(nextRepository);
      setProfile(nextProfile);
      setRepository(nextRepository);
      setGate(nextProfile.onboardingCompletedAt ? "ready" : "onboarding");
    },
    [],
  );

  const prepareSession = useCallback(
    async (nextSession: Session) => {
      const user = nextSession.user;
      setSession(nextSession);
      if (!user.email_confirmed_at) {
        setGate("confirm-email");
        return;
      }
      const client = getSupabaseBrowserClient();
      const nextRepository = new SupabasePlannerRepository(client, user.id);
      try {
        const [{ data: profileRow, error: profileError }, local, remote] =
          await Promise.all([
            client.from("profiles").select("*").maybeSingle(),
            new LocalPlannerRepository().readState(),
            nextRepository.readRemoteState(),
          ]);
        if (profileError) throw profileError;
        const nextProfile = profileFromUser(
          user,
          (profileRow ?? {}) as Record<string, unknown>,
        );
        window.localStorage.setItem(
          `colmeia-onboarding-${user.id}`,
          nextProfile.onboardingCompletedAt ?? "pending",
        );
        setProfile(nextProfile);
        setRepository(nextRepository);
        setLegacyState(local);
        if (hasLegacyData(local)) {
          setRemoteHasData(hasRemoteFinancialData(remote));
          setGate("migration");
          return;
        }
        continueAfterMigration(nextProfile, nextRepository);
      } catch (caught) {
        const completed = window.localStorage.getItem(`colmeia-onboarding-${user.id}`);
        if (!navigator.onLine && completed && completed !== "pending") {
          const offlineProfile = profileFromUser(user, {
            onboarding_completed_at: completed,
          });
          continueAfterMigration(offlineProfile, nextRepository);
          return;
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível preparar sua conta.",
        );
        setGate("error");
      }
    },
    [continueAfterMigration],
  );

  useEffect(() => {
    const connected = () => setOnline(true);
    const disconnected = () => setOnline(false);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
    };
  }, []);

  useEffect(() => {
    if (!configured) return;
    const client = getSupabaseBrowserClient();
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) void prepareSession(data.session);
      else setGate("signed-out");
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (nextSession) void prepareSession(nextSession);
      else {
        setSession(null);
        setProfile(null);
        setGate("signed-out");
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured, prepareSession]);

  const finishOnboarding = async () => {
    if (!session || !profile || !repository) return;
    const completedAt = new Date().toISOString();
    const { error: updateError } = await getSupabaseBrowserClient()
      .from("profiles")
      .update({ onboarding_completed_at: completedAt, updated_at: completedAt })
      .eq("user_id", session.user.id);
    if (updateError) throw updateError;
    const next = { ...profile, onboardingCompletedAt: completedAt };
    window.localStorage.setItem(`colmeia-onboarding-${profile.id}`, completedAt);
    configurePlannerRepository(repository);
    setProfile(next);
    setReplayTour(false);
    setGate("ready");
  };

  const useCloud = () => {
    if (profile && repository) continueAfterMigration(profile, repository);
  };
  const importLegacy = async () => {
    if (!legacyState || !profile || !repository) return;
    const clean = sanitizeLegacyState(legacyState);
    const invalid = validatePlannerReferences(clean);
    if (invalid.length) throw new Error(invalid[0]);
    const remote = await repository.migrateLegacy(clean, migrationIdForState(clean));
    const mismatches = [
      ...compareMigrationCounts(clean, remote),
      ...validatePlannerReferences(remote),
    ];
    if (mismatches.length) throw new Error(mismatches[0]);
    continueAfterMigration(profile, repository);
  };

  const signOut = async () => {
    await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
    clearAuthenticationStorage();
    setSession(null);
    setProfile(null);
    setGate("signed-out");
  };
  const deleteAccount = async () => {
    const { error: deleteError } =
      await getSupabaseBrowserClient().rpc("delete_my_account");
    if (deleteError) throw deleteError;
    clearAuthenticationStorage();
    setSession(null);
    setProfile(null);
    setGate("signed-out");
  };

  const counts = useMemo(
    () => (legacyState ? countLegacyData(legacyState) : null),
    [legacyState],
  );
  if (gate === "booting") return <LoadingGate />;
  if (gate === "signed-out")
    return (
      <AuthScreen initialMode={authMode ?? routeAuthMode} onModeChange={setAuthMode} />
    );
  if (gate === "confirm-email") return <AuthScreen initialMode="confirm" />;
  if (gate === "error")
    return <ErrorGate message={error} onRetry={() => window.location.reload()} />;
  if (gate === "migration" && legacyState && counts)
    return (
      <MigrationDialog
        counts={counts}
        remoteHasData={remoteHasData}
        onBackup={() => downloadBackup(legacyState)}
        onImport={importLegacy}
        onUseCloud={useCloud}
        onCancel={signOut}
      />
    );
  if (gate === "onboarding")
    return <Onboarding onFinish={finishOnboarding} onSkip={finishOnboarding} />;
  if (gate === "ready" && profile)
    return (
      <>
        {replayTour ? (
          <Onboarding
            replay
            onFinish={() => setReplayTour(false)}
            onSkip={() => setReplayTour(false)}
          />
        ) : (
          <PlannerApp
            profile={profile}
            online={online}
            onSignOut={signOut}
            onReplayTour={() => setReplayTour(true)}
            onDeleteAccount={deleteAccount}
          />
        )}
      </>
    );
  return <LoadingGate />;
}

function LoadingGate() {
  return (
    <main className="gate-state" aria-live="polite">
      <BrandMark />
      <span className="gate-loader" />
      <h1>Preparando sua Colmeia</h1>
      <p>Validando a sessão e sincronizando seus dados.</p>
    </main>
  );
}
function ErrorGate({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="gate-state">
      <BrandMark />
      <h1>Não foi possível continuar</h1>
      <p>{message}</p>
      <button className="button" type="button" onClick={onRetry}>
        Tentar novamente
      </button>
      <p className="muted-copy">Nenhum dado local foi apagado.</p>
    </main>
  );
}
