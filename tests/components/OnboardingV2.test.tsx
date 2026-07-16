import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Onboarding, onboardingSteps } from "../../app/components/Onboarding";

describe("onboarding V2", () => {
  it("usa cinco etapas, move foco e só finaliza no fim", () => {
    const finish = vi.fn();
    render(<Onboarding onFinish={finish} />);
    expect(
      screen.getByRole("heading", { name: onboardingSteps[0].title }),
    ).toHaveFocus();
    for (let step = 0; step < 4; step += 1)
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: /Ir para meu painel/ }));
    expect(finish).toHaveBeenCalledOnce();
  });

  it("declara que os dados fictícios não são persistidos", () => {
    render(<Onboarding onFinish={vi.fn()} />);
    expect(
      screen.getByText(
        "Os exemplos deste tour não são gravados no navegador nem na nuvem.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByLabelText(/Usar dados demonstrativos/),
    ).not.toBeInTheDocument();
  });
});
