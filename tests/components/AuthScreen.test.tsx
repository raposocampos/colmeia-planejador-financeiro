import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthScreen } from "../../app/components/AuthScreen";

describe("telas de autenticação", () => {
  it("login é acessível, manter conectado inicia desmarcado e valida campos", async () => {
    render(<AuthScreen reviewOnAuthenticated={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Entrar na Colmeia" })).toBeVisible();
    expect(screen.getByLabelText(/Manter-me conectado/)).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /^Entrar$/ }));
    expect(
      await screen.findByText("Informe um e-mail em formato válido."),
    ).toBeVisible();
  });

  it("cadastro exige senha forte, confirmação e aceites", async () => {
    render(<AuthScreen initialMode="signup" reviewOnAuthenticated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Pessoa" } });
    fireEvent.change(screen.getByLabelText("E-mail", { selector: "input" }), {
      target: { value: "pessoa@teste.dev" },
    });
    fireEvent.change(screen.getByLabelText("Senha", { exact: true }), {
      target: { value: "curta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Criar conta$/ }));
    expect(await screen.findByText("Use pelo menos 12 caracteres.")).toBeVisible();
    expect(screen.getByText("Aceite os Termos de Uso.")).toBeVisible();
  });

  it("modo de revisão percorre confirmação sem chamar provedor real", async () => {
    const authenticated = vi.fn();
    render(<AuthScreen initialMode="signup" reviewOnAuthenticated={authenticated} />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Pessoa" } });
    fireEvent.change(screen.getByLabelText("E-mail", { selector: "input" }), {
      target: { value: "pessoa@teste.dev" },
    });
    fireEvent.change(screen.getByLabelText("Senha", { exact: true }), {
      target: { value: "SenhaSegura123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "SenhaSegura123" },
    });
    fireEvent.click(screen.getByLabelText(/Termos de Uso/));
    fireEvent.click(screen.getByLabelText(/Política de Privacidade/));
    fireEvent.click(screen.getByRole("button", { name: /^Criar conta$/ }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Confirme seu e-mail" }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Simular e-mail confirmado" }));
    expect(authenticated).toHaveBeenCalledOnce();
  });
});
