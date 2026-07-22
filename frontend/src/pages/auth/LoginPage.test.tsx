import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renders login page elements correctly", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Verify Login heading exists
    expect(screen.getByRole("heading", { name: /Welcome Back/i })).toBeInTheDocument();

    // Verify Email input exists
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

    // Verify Password input exists
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Verify Login button exists
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });
});
