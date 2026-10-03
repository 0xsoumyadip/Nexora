"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/features/marketing";
import { sendVerificationOTP, verifyEmailOTP } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@/client";

export function VerifyEmailPanel() {
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {


    const data = searchParams.get("email");

    setEmail(data ?? "")
  }, [])

  useEffect(() => {
    if (!email) return;
    async function sendInitialOTP() {
      setMessage("");
      setIsSending(true);

      try {
        const result = await sendVerificationOTP(email);
        console.log(result);

        setMessage("A varification code is sent to your email address.")
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Unable to send varification code.");
      } finally {
        setIsSending(false);
      }
    }

    sendInitialOTP();
  }, [])

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsVerifying(true);

    try {
      await verifyEmailOTP(email, otp);
      setIsVerified(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "That code could not be verified. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setMessage("");
    setIsSending(true);

    try {
      const result = await sendVerificationOTP(email);

      setMessage("A varification code is sent at your email address.")
      
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send a verification code right now.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="status-page">
      <Logo />
      <MailCheck size={48} aria-hidden="true" />
      <h1>{isVerified ? "Email verified" : "Check your email"}</h1>
      <p>
        {isVerified
          ? "Your email address is verified. You can now sign in."
          : "Enter the six-digit code we sent to your email address."}
      </p>

      {isVerified ? (
        <Link className="btn" href="/login">
          Go to sign in
        </Link>
      ) : (
        <form onSubmit={handleVerify}>
          <label htmlFor="verification-code">Verification code</label>
          <input
            id="verification-code"
            className="input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          />
          {message && <p role="status">{message}</p>}
          <button className="btn" type="submit" disabled={isVerifying}>
            {isVerifying ? "Verifying…" : "Verify email"}
          </button>
          <button
            className="btn secondary"
            type="button"
            disabled={isSending || !email}
            onClick={handleResend}
          >
            {isSending ? "Sending…" : "Resend code"}
          </button>
        </form>
      )}

      {!isVerified && !message && (
        <p className="muted" style={{ marginTop: 16 }}>
          Check your spam folder if you don’t see the email.
        </p>
      )}
    </main>
  );
}
