"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/features/marketing";
import { routes } from "@/lib/constants";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const login = mode === "login";

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("button clicked");
    if (mode === "login") {
      console.log(email, password);
      await signIn({ email, password });
    } else {
      await signUp({ name: fullName, userName, email, password });
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
