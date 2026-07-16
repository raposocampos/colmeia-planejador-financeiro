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
    expect(
      screen.getByRole("img", { name: onboardingSteps[0].imageAlt }),
    ).toBeVisible();
    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
      expect(
        screen.getByRole("img", { name: onboardingSteps[step + 1].imageAlt }),
      ).toBeVisible();
    }
    fireEvent.click(screen.getByRole("button", { name: /Ir para meu painel/ }));
    expect(finish).toHaveBeenCalledOnce();
  });

  it("declara que as capturas fictícias não alteram a conta", () => {
    render(<Onboarding onFinish={vi.fn()} />);
    expect(
      screen.getByText("As capturas usam dados fictícios e não alteram sua conta."),
    ).toBeVisible();
    expect(
      screen.queryByLabelText(/Usar dados demonstrativos/),
    ).not.toBeInTheDocument();
  });
});
