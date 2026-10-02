import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/features/marketing";
import { auth } from "@nexora/auth/auth";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({ searchParams }: { searchParams?: { token?: string; callbackUrl?: string } }) {
  const token = searchParams?.token;

  if (!token) {
    redirect("/login?error=missing_verification_token");
  }

  try {
    await auth.api.verifyEmail({
      query: { token },
    });

    redirect("/login?verified=1")
  } catch (error) {
    redirect("/login?error=invalid_varification")
  }

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
