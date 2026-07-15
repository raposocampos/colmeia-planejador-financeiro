import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "../../app/components/BrandMark";

describe("BrandMark", () => {
  it("usa o nome oficial da marca", () => {
    render(<BrandMark />);
    expect(screen.getByLabelText("Colmeia Educação Financeira")).toBeInTheDocument();
    expect(screen.getByText("EDUCAÇÃO FINANCEIRA")).toBeInTheDocument();
  });
});
