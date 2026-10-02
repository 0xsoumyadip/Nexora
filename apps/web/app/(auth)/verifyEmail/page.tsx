import { VerifyEmailPanel } from "@/features/verify-email";

type VerifyEmailSearchParams = Promise<{
  verified?: string | string[];
  error?: string | string[];
}>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: VerifyEmailSearchParams;
}) {
  const params = await searchParams;
  const verified = Array.isArray(params.verified)
    ? params.verified[0] === "1"
    : params.verified === "1";
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return <VerifyEmailPanel verified={verified} hasError={Boolean(error)} />;
}
