"use client";

import { useState } from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormRegisterReturn,
  type UseFormSetError,
} from "react-hook-form";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import type { ZodType } from "zod";
import { BrandMark } from "./BrandMark";
import {
  authRedirectUrl,
  getSupabaseBrowserClient,
  setRememberPreference,
} from "../lib/supabase";
import {
  loginSchema,
  recoverySchema,
  resetPasswordSchema,
  signUpSchema,
  type LoginValues,
  type RecoveryValues,
  type ResetPasswordValues,
  type SignUpValues,
} from "../lib/authValidation";

export type AuthMode = "login" | "signup" | "confirm" | "forgot" | "reset" | "error";

interface AuthScreenProps {
  initialMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  reviewOnAuthenticated?: () => void;
}

const setSchemaErrors = <TInput extends FieldValues, TOutput>(
  schema: ZodType<TOutput, TInput>,
  values: TInput,
  setError: UseFormSetError<TInput>,
): TOutput | null => {
  const parsed = schema.safeParse(values);
  if (parsed.success) return parsed.data;
  const fieldsWithErrors = new Set<string>();
  for (const issue of parsed.error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !fieldsWithErrors.has(path)) {
      setError(path as Path<TInput>, { message: issue.message });
      fieldsWithErrors.add(path);
    }
  }
  return null;
};

const safeAuthMessage =
  "Não foi possível concluir. Revise os dados ou tente novamente em instantes.";

export function AuthScreen({
  initialMode = "login",
  onModeChange,
  reviewOnAuthenticated,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const changeMode = (next: AuthMode) => {
    setMessage("");
    setMode(next);
    onModeChange?.(next);
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="Colmeia Educação Financeira">
        <BrandMark />
        <div>
          <p className="eyebrow">SEU DINHEIRO, COM MAIS CLAREZA</p>
          <h1>Organização que acompanha você.</h1>
          <p>
            Sincronize seus registros com segurança e continue de onde parou em outro
            dispositivo.
          </p>
        </div>
        <p className="auth-security-note">
          <LockKeyhole size={17} /> Seus dados financeiros são separados por conta.
        </p>
      </section>
      <section className="auth-form-panel">
        {mode === "login" && (
          <LoginForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            setMessage={setMessage}
            onMode={changeMode}
            reviewOnAuthenticated={reviewOnAuthenticated}
          />
        )}
        {mode === "signup" && (
          <SignUpForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            setMessage={setMessage}
            onMode={changeMode}
            reviewOnAuthenticated={reviewOnAuthenticated}
          />
        )}
        {mode === "forgot" && (
          <RecoveryForm setMessage={setMessage} onMode={changeMode} />
        )}
        {mode === "reset" && (
          <ResetForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            setMessage={setMessage}
            onMode={changeMode}
          />
        )}
        {mode === "confirm" && (
          <ConfirmEmailForm
            setMessage={setMessage}
            onMode={changeMode}
            reviewOnAuthenticated={reviewOnAuthenticated}
          />
        )}
        {mode === "error" && (
          <InfoState
            title="Não foi possível autenticar"
            text="O acesso foi cancelado ou o link não é mais válido. Tente novamente sem compartilhar o endereço desta página."
            action="Voltar para entrar"
            onAction={() => changeMode("login")}
          />
        )}
        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

function LoginForm({
  showPassword,
  setShowPassword,
  setMessage,
  onMode,
  reviewOnAuthenticated,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setMessage: (value: string) => void;
  onMode: (mode: AuthMode) => void;
  reviewOnAuthenticated?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "", remember: false },
  });
  const submit = handleSubmit(async (raw) => {
    const values = setSchemaErrors(loginSchema, raw, setError);
    if (!values) return;
    setRememberPreference(values.remember);
    if (reviewOnAuthenticated) {
      const selected = values.remember ? window.localStorage : window.sessionStorage;
      selected.setItem("colmeia-review-session", "confirmed");
      reviewOnAuthenticated();
      return;
    }
    const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) setMessage(safeAuthMessage);
  });
  const google = async () => {
    const remember = getValues("remember");
    setRememberPreference(remember);
    if (reviewOnAuthenticated) {
      const selected = remember ? window.localStorage : window.sessionStorage;
      selected.setItem("colmeia-review-session", "confirmed");
      reviewOnAuthenticated();
      return;
    }
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authRedirectUrl("/auth/callback/") },
    });
    if (error)
      setMessage("O acesso com Google foi cancelado ou não pôde ser iniciado.");
  };
  return (
    <div className="auth-card">
      <p className="eyebrow">BEM-VINDO DE VOLTA</p>
      <h2>Entrar na Colmeia</h2>
      <p>Use sua conta para acessar os dados sincronizados.</p>
      <form onSubmit={submit} noValidate>
        <Field label="E-mail" error={errors.email?.message} icon={<Mail size={17} />}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <PasswordField
          label="Senha"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          registration={register("password")}
          autoComplete="current-password"
        />
        <label className="check-row auth-remember">
          <input type="checkbox" {...register("remember")} />
          <span>
            <strong>Manter-me conectado neste dispositivo</strong>
            <small>Evite esta opção em computadores compartilhados.</small>
          </span>
        </label>
        <button className="button auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <button
        className="button button--secondary auth-google"
        type="button"
        onClick={google}
      >
        Entrar com Google
      </button>
      <button className="text-button" type="button" onClick={() => onMode("forgot")}>
        Esqueci minha senha
      </button>
      <p className="auth-switch">
        Ainda não tem conta?{" "}
        <button type="button" onClick={() => onMode("signup")}>
          Criar conta
        </button>
      </p>
    </div>
  );
}

function SignUpForm({
  showPassword,
  setShowPassword,
  setMessage,
  onMode,
  reviewOnAuthenticated,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setMessage: (value: string) => void;
  onMode: (mode: AuthMode) => void;
  reviewOnAuthenticated?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });
  const submit = handleSubmit(async (raw) => {
    const values = setSchemaErrors(signUpSchema, raw, setError);
    if (!values) return;
    if (reviewOnAuthenticated) {
      onMode("confirm");
      return;
    }
    const { data, error } = await getSupabaseBrowserClient().auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
        emailRedirectTo: authRedirectUrl("/auth/callback/"),
      },
    });
    if (error) {
      setMessage(safeAuthMessage);
      return;
    }
    if (!data.session) onMode("confirm");
  });
  return (
    <div className="auth-card auth-card--wide">
      <p className="eyebrow">CRIE SEU ESPAÇO</p>
      <h2>Criar conta</h2>
      <p>A confirmação do e-mail é necessária antes de acessar o painel.</p>
      <form onSubmit={submit} noValidate>
        <Field label="Nome" error={errors.name?.message} icon={<UserRound size={17} />}>
          <input autoComplete="name" {...register("name")} />
        </Field>
        <Field label="E-mail" error={errors.email?.message} icon={<Mail size={17} />}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <PasswordField
          label="Senha"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          registration={register("password")}
          autoComplete="new-password"
        />
        <p className="password-help">
          Use 12 ou mais caracteres, com maiúscula, minúscula e número.
        </p>
        <PasswordField
          label="Confirmar senha"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.passwordConfirmation?.message}
          registration={register("passwordConfirmation")}
          autoComplete="new-password"
        />
        <label className="check-row">
          <input type="checkbox" {...register("acceptTerms")} />
          <span>
            Li e aceito os <a href="/termos/">Termos de Uso</a>.
          </span>
        </label>
        {errors.acceptTerms && (
          <span className="field-error">{errors.acceptTerms.message}</span>
        )}
        <label className="check-row">
          <input type="checkbox" {...register("acceptPrivacy")} />
          <span>
            Li e aceito a <a href="/privacidade/">Política de Privacidade</a>.
          </span>
        </label>
        {errors.acceptPrivacy && (
          <span className="field-error">{errors.acceptPrivacy.message}</span>
        )}
        <button className="button auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="auth-switch">
        Já tem conta?{" "}
        <button type="button" onClick={() => onMode("login")}>
          Entrar
        </button>
      </p>
    </div>
  );
}

function RecoveryForm({
  setMessage,
  onMode,
}: {
  setMessage: (value: string) => void;
  onMode: (mode: AuthMode) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryValues>({ defaultValues: { email: "" } });
  const submit = handleSubmit(async (raw) => {
    const values = setSchemaErrors(recoverySchema, raw, setError);
    if (!values) return;
    await getSupabaseBrowserClient().auth.resetPasswordForEmail(values.email, {
      redirectTo: authRedirectUrl("/auth/reset-password/"),
    });
    setMessage(
      "Se houver uma conta para este e-mail, enviaremos as instruções de recuperação.",
    );
  });
  return (
    <div className="auth-card">
      <p className="eyebrow">RECUPERAÇÃO SEGURA</p>
      <h2>Esqueci minha senha</h2>
      <p>Informe o e-mail. A resposta não revela se uma conta existe.</p>
      <form onSubmit={submit} noValidate>
        <Field label="E-mail" error={errors.email?.message} icon={<Mail size={17} />}>
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <button className="button auth-submit" disabled={isSubmitting}>
          Enviar instruções
        </button>
      </form>
      <button className="text-button" type="button" onClick={() => onMode("login")}>
        Voltar para entrar
      </button>
    </div>
  );
}

function ConfirmEmailForm({
  setMessage,
  onMode,
  reviewOnAuthenticated,
}: {
  setMessage: (value: string) => void;
  onMode: (mode: AuthMode) => void;
  reviewOnAuthenticated?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryValues>({ defaultValues: { email: "" } });
  const resend = handleSubmit(async (raw) => {
    const values = setSchemaErrors(recoverySchema, raw, setError);
    if (!values) return;
    await getSupabaseBrowserClient().auth.resend({
      type: "signup",
      email: values.email,
      options: { emailRedirectTo: authRedirectUrl("/auth/callback/") },
    });
    setMessage(
      "Se o cadastro estiver aguardando confirmação, enviaremos uma nova mensagem.",
    );
  });
  return (
    <div className="auth-card auth-info">
      <span className="settings-icon">
        <Mail size={24} />
      </span>
      <h2>Confirme seu e-mail</h2>
      <p>
        Abra o link enviado pelo provedor. O painel só é liberado depois da confirmação.
      </p>
      <form onSubmit={resend} noValidate>
        <Field
          label="E-mail para reenviar"
          error={errors.email?.message}
          icon={<Mail size={17} />}
        >
          <input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <button className="button" disabled={isSubmitting}>
          Reenviar confirmação
        </button>
      </form>
      {reviewOnAuthenticated && (
        <button
          className="button button--secondary"
          type="button"
          onClick={() => {
            window.sessionStorage.setItem("colmeia-review-session", "confirmed");
            reviewOnAuthenticated();
          }}
        >
          Simular e-mail confirmado
        </button>
      )}
      <button className="text-button" type="button" onClick={() => onMode("login")}>
        Voltar para entrar
      </button>
    </div>
  );
}

function ResetForm({
  showPassword,
  setShowPassword,
  setMessage,
  onMode,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setMessage: (value: string) => void;
  onMode: (mode: AuthMode) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    defaultValues: { password: "", passwordConfirmation: "" },
  });
  const submit = handleSubmit(async (raw) => {
    const values = setSchemaErrors(resetPasswordSchema, raw, setError);
    if (!values) return;
    const { error } = await getSupabaseBrowserClient().auth.updateUser({
      password: values.password,
    });
    if (error) {
      setMessage(safeAuthMessage);
      return;
    }
    setMessage("Senha atualizada. Você já pode entrar com a nova senha.");
    onMode("login");
  });
  return (
    <div className="auth-card">
      <p className="eyebrow">NOVA SENHA</p>
      <h2>Redefinir senha</h2>
      <form onSubmit={submit} noValidate>
        <PasswordField
          label="Nova senha"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.password?.message}
          registration={register("password")}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirmar nova senha"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.passwordConfirmation?.message}
          registration={register("passwordConfirmation")}
          autoComplete="new-password"
        />
        <button className="button auth-submit" disabled={isSubmitting}>
          Salvar nova senha
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input">
        {icon}
        {children}
      </span>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
function PasswordField({
  label,
  show,
  toggle,
  error,
  registration,
  autoComplete,
}: {
  label: string;
  show: boolean;
  toggle: () => void;
  error?: string;
  registration: UseFormRegisterReturn<string>;
  autoComplete: string;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="auth-input">
        <LockKeyhole size={17} />
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          {...registration}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={toggle}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
function InfoState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="auth-card auth-info">
      <span className="settings-icon">
        <Mail size={24} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="button" type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}
