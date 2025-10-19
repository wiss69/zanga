import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";
import "@testing-library/jest-dom";

describe("HomePage", () => {
  it("renders hero title", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Zinga.io — lancez vos projets import\/export en confiance/i)
    ).toBeInTheDocument();
  });
});
