import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "../../app/components/ProgressBar";

describe("ProgressBar", () => {
  it("expõe valor e rótulo acessíveis", () => {
    render(<ProgressBar value={82} label="Alimentação: 82%" tone="warning" />);
    const progress = screen.getByRole("progressbar", {
      name: "Alimentação: 82%",
    });
    expect(progress).toHaveAttribute("aria-valuenow", "82");
  });

  it("limita o valor visual a cem por cento", () => {
    render(<ProgressBar value={140} label="Orçamento excedido" />);
    expect(
      screen.getByRole("progressbar", { name: "Orçamento excedido" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });
});
