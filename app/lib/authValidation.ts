import { z } from "zod";

export const normalizeEmail = (value: string): string => {
  const trimmed = value.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return trimmed;
  return `${trimmed.slice(0, at)}@${trimmed.slice(at + 1).toLocaleLowerCase("en-US")}`;
};

export const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.email("Informe um e-mail em formato válido."));

export const passwordSchema = z
  .string()
  .min(12, "Use pelo menos 12 caracteres.")
  .refine((value) => /[a-z]/.test(value), "Inclua uma letra minúscula.")
  .refine((value) => /[A-Z]/.test(value), "Inclua uma letra maiúscula.")
  .refine((value) => /\d/.test(value), "Inclua um número.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean(),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome."),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
    acceptTerms: z.boolean().refine(Boolean, "Aceite os Termos de Uso."),
    acceptPrivacy: z.boolean().refine(Boolean, "Aceite a Política de Privacidade."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas precisam ser iguais.",
  });

export const recoverySchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z
  .object({ password: passwordSchema, passwordConfirmation: z.string() })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas precisam ser iguais.",
  });

export type LoginValues = z.input<typeof loginSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;
export type RecoveryValues = z.input<typeof recoverySchema>;
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;
