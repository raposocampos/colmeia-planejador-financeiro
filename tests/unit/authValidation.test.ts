import { describe, expect, it } from "vitest";
import {
  emailSchema,
  normalizeEmail,
  passwordSchema,
  signUpSchema,
} from "../../app/lib/authValidation";

describe("validação de autenticação", () => {
  it("remove espaços e normaliza somente o domínio do e-mail", () => {
    expect(normalizeEmail("  Pessoa@EXEMPLO.COM  ")).toBe("Pessoa@exemplo.com");
    expect(emailSchema.parse(" pessoa@EXEMPLO.COM ")).toBe("pessoa@exemplo.com");
  });

  it("rejeita e-mail em formato inválido sem afirmar que ele existe", () => {
    expect(emailSchema.safeParse("sem-arroba").success).toBe(false);
  });

  it("exige senha de 12 caracteres, maiúscula, minúscula e número", () => {
    expect(passwordSchema.safeParse("curta1A").success).toBe(false);
    expect(passwordSchema.safeParse("SenhaSegura123").success).toBe(true);
  });

  it("exige senhas iguais e os dois aceites", () => {
    const result = signUpSchema.safeParse({
      name: "Pessoa",
      email: "pessoa@teste.dev",
      password: "SenhaSegura123",
      passwordConfirmation: "OutraSenha123",
      acceptTerms: false,
      acceptPrivacy: false,
    });
    expect(result.success).toBe(false);
  });
});
