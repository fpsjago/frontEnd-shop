import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import "../../styles/components/auth.css";
import { ApiError, apiClient } from "../../lib/api";
import { authService, type AuthResponse } from "../../services/authService";

export interface LoginFormProps {
  heading?: string;
  subtitle?: string;
  error?: string;
  submitLabel?: string;
  forgotPasswordHref?: string;
  forgotPasswordLabel?: string;
  redirectTo?: string;
  onSuccess?: (response: AuthResponse) => void;
  createAccountHref?: string;
  createAccountLabel?: string;
}

const LoginForm = ({
  heading = "Sign in to your account",
  subtitle = "Use your email and password to continue.",
  error,
  submitLabel = "Log in",
  forgotPasswordHref,
  forgotPasswordLabel = "Forgot password?",
  redirectTo = "/admin",
  onSuccess,
  createAccountHref,
  createAccountLabel = "Create an account",
}: LoginFormProps) => {
  const [formError, setFormError] = useState<string | null>(error ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormError(error ?? null);
  }, [error]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("frontend_shop_token");
    if (storedToken) {
      applyAuthHeader(storedToken);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const auth = await authService.login({ email, password });
      console.log("[LoginForm] auth response:", auth);
      onSuccess?.(auth);

      if (auth?.token) {
        persistToken(auth.token);
        applyAuthHeader(auth.token);
        console.log(
          "[LoginForm] persisted token:",
          typeof window !== "undefined" ? localStorage.getItem("frontend_shop_token") : null
        );
      }

      if (redirectTo) {
        window.location.assign(redirectTo);
      } else {
        form.reset();
      }
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-decor" aria-hidden="true">
        <span className="auth-decor__gradient auth-decor__gradient--primary" />
        <span className="auth-decor__gradient auth-decor__gradient--secondary" />
        <span className="auth-decor__ring auth-decor__ring--left" />
        <span className="auth-decor__ring auth-decor__ring--right" />
      </div>

      <div className="auth-wrapper">
        <aside className="auth-showcase">
          <p className="auth-showcase__badge">Creator&apos;s pick · 2025</p>
          <h2 className="auth-showcase__title">
            Launch and scale your marketplace in days.
          </h2>
          <p className="auth-showcase__text">
            Combine modular storefront blocks, real-time analytics, and collaborative workflows
            inside one command center.
          </p>
          <ul className="auth-showcase__stats">
            <li>
              <strong>3k+</strong>
              <span>digital assets</span>
            </li>
            <li>
              <strong>98%</strong>
              <span>customer satisfaction</span>
            </li>
            <li>
              <strong>15 min</strong>
              <span>average onboarding</span>
            </li>
          </ul>
        </aside>

        <div className="auth-card-stack">
          <div className="auth-card-shell">
            <span className="auth-card-shell__glow" aria-hidden="true" />
            <div className="surface-card auth-card">
              <div className="auth-card__header">
                <span className="auth-card__pill">Frontend Shop</span>
                <h1>{heading}</h1>
                {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
                <p className="auth-card__meta">
                  Enterprise-grade encryption, SOC2 compliance, and one-click workspace rollbacks.
                </p>
              </div>
              {formError && (
                <p className="auth-card__error" role="status" aria-live="polite">
                  {formError}
                </p>
              )}
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="********"
                    minLength={6}
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : submitLabel}
                </button>
              </form>

              {(createAccountHref || forgotPasswordHref) && (
                <div className="auth-card__actions">
                  {createAccountHref && (
                    <a className="auth-card__link" href={createAccountHref}>
                      {createAccountLabel}
                    </a>
                  )}
                  {forgotPasswordHref && (
                    <a className="auth-card__link auth-card__link--muted" href={forgotPasswordHref}>
                      {forgotPasswordLabel}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function extractErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const data = error.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    return error.message || "Authentication failed.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to log in. Please try again.";
}

function persistToken(token: string) {
  try {
    localStorage.setItem("frontend_shop_token", token);
  } catch (storageError) {
    console.warn("[LoginForm] Failed to persist token to localStorage:", storageError);
  }
}

function applyAuthHeader(token: string) {
  try {
    apiClient.setHeader("Authorization", `Bearer ${token}`);
  } catch (error) {
    console.warn("[LoginForm] Failed to apply Authorization header:", error);
  }
}



export default LoginForm;
