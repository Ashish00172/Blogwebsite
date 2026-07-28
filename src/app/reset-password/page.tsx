import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

interface ResetPasswordPageProps {
  searchParams?: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params?.token ?? null;

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Choose a new secure password for your account."
      footerText="Back to"
      footerHref="/login"
      footerLabel="login"
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
