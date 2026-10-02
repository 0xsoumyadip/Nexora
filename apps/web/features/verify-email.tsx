"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "@/features/marketing";
import { resendVerification } from "@/lib/auth";

export function VerifyEmailPanel({
  verified,
  hasError,
}: {
  verified: boolean;
  hasError: boolean;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    hasError ? "That verification link is invalid or has expired." : "",
  );
  const [isSending, setIsSending] = useState(false);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSending(true);

    try {
      const result = await resendVerification(email);
      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send a verification email right now.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="status-page">
      <Logo />
      <MailCheck size={48} aria-hidden="true" />
      <h1>{verified ? "Email verified" : "Check your email"}</h1>
      <p>
        {verified
          ? "Your email address is verified. You can now sign in."
          : "Open the verification link we sent you. It will bring you back here when your email is verified."}
      </p>

      {verified ? (
        <Link className="btn" href="/login">
          Go to sign in
        </Link>
      ) : (
        <form onSubmit={handleResend}>
          <label htmlFor="verification-email">Need another link?</label>
          <input
            id="verification-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {message && <p role="status">{message}</p>}
          <button className="btn" type="submit" disabled={isSending}>
            {isSending ? "Sending…" : "Resend verification email"}
          </button>
        </form>
      )}

      {!verified && !message && (
        <p className="muted" style={{ marginTop: 16 }}>
          Check your spam folder if you don’t see the email.
        </p>
      )}
    </main>
  );
}
