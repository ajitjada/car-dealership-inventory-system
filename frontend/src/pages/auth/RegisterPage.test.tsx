import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { RegisterPage } from "./RegisterPage";

describe("RegisterPage", () => {
  it("renders register page elements correctly", () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Verify Register heading exists
    expect(screen.getByRole("heading", { name: /Create an Account/i })).toBeInTheDocument();

    // Verify Name input exists
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();

    // Verify Email input exists
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

    // Verify Password input exists
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();

    // Verify Confirm Password input exists
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();

    // Verify Register button exists
    expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
  });
});
