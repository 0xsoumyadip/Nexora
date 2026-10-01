"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/features/marketing";
import { routes } from "@/lib/constants";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { ApiError } from "@/client";
import { useRouter } from "next/navigation";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const login = mode === "login";
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState("");

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    try {
      const response =
        mode === "login"
          ? await signIn({ email, password })
          : await signUp({
              name: fullName,
              userName,
              email,
              password,
            });

      if (response.status) {
        router.push(mode === "login" ? "/dashboard" : "/verifyEmail");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors);
        setFormError(error.message);
      } else {
        setFormError("Something went wrong.");
      }
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-form-pane">
        <form onSubmit={handleSubmit}>
          <div className="auth-card">
            <Logo />
            <h1>{login ? "Welcome back" : "Create your account"}</h1>
            <p>
              {login
                ? "Pick up where your team left off."
                : "Start building better shared context today."}
            </p>
            <div>
              {!login && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="input"
                    autoComplete="name"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {fieldErrors.name?.[0] && (
                    <small className="field-error">
                      {fieldErrors.name[0]}
                    </small>
                  )}
                </div>
              )}
              {!login && (
                <div className="form-group">
                  <label>User Name</label>
                  <input
                    className="input"
                    autoComplete="name"
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  {fieldErrors.userName?.[0] && (
                    <small className="field-error">
                      {fieldErrors.userName[0]}
                    </small>
                  )}
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email?.[0] && (
                  <small className="field-error">
                    {fieldErrors.email[0]}
                  </small>
                )}
              </div>
              <div className="form-group">
                <div className="form-row">
                  <label>Password</label>
                  {login && (
                    <a className="muted" href="#">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="password-wrap">
                  <input
                    className="input"
                    type="password"
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {fieldErrors.password?.[0] && (
                    <small className="field-error">
                      {fieldErrors.password[0]}
                    </small>
                  )}
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Show password"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                {!login && (
                  <>
                    <div className="strength">
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <small className="muted">
                      Use 8+ characters with a number or symbol
                    </small>
                  </>
                )}
              </div>
              <label className="muted">
                <input type="checkbox" />{" "}
                {login
                  ? "Remember me"
                  : "I agree to the Terms and Privacy Policy"}
              </label>
              {formError && <div className="form-alert">{formError}</div>}
              <button className="btn full" type="submit">
                {login ? "Log in" : "Create account"}
              </button>
            </div>
            <div className="divider">or continue with</div>
            <div className="socials">
              <button className="btn secondary" type="button">
                Google
              </button>
              <button className="btn secondary" type="button">
                GitHub
              </button>
            </div>
            <p className="muted" style={{ textAlign: "center", marginTop: 22 }}>
              {login ? "Don't have an account? " : "Already have an account? "}
              <Link
                style={{ color: "var(--primary)" }}
                href={login ? routes.register : routes.login}
              >
                {login ? "Sign up" : "Log in"}
              </Link>
            </p>
          </div>
        </form>
      </main>
      <aside className="brand-panel">
        <Logo />
        <blockquote>
          “Nexora gives our ideas one clear place to grow — without getting in
          the way.”
        </blockquote>
        <p>Built for teams who care about clarity.</p>
      </aside>
    </div>
  );
}
