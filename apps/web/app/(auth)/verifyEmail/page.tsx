import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/features/marketing";

export default function VerifyEmailPage() {
  return (
    <main className="status-page">
      <Logo />
      <MailCheck size={48} aria-hidden="true" />
      <h1>Check your email</h1>
      <p>
        We sent you a verification link. Open it to verify your email address,
        then come back and sign in.
      </p>
      <Link className="btn" href="/login">
        Go to sign in
      </Link>
      <p className="muted" style={{ marginTop: 16 }}>
        Didn’t get the email? Check your spam folder.
      </p>
    </main>
  );
}
