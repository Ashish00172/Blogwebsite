import "server-only";

import nodemailer from "nodemailer";

type PasswordResetEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

function getAppUrl() {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    from,
    transport: nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user,
        pass,
      },
    }),
  };
}

export function buildPasswordResetUrl(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    throw new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
  }

  const displayName = input.name?.trim() || "there";

  try {
    await smtp.transport.sendMail({
      from: smtp.from,
      to: input.to,
      subject: "Reset your Aurelia password",
      text: `Hi ${displayName},\n\nUse this link to reset your password:\n${input.resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <p>Hi ${displayName},</p>
          <p>Use this link to reset your password:</p>
          <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
          <p>If you did not request a password reset, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    const authError = error as {
      responseCode?: number;
      code?: string;
    };

    if (authError.code === "EAUTH" || authError.responseCode === 535) {
      throw new Error(
        "Gmail rejected the SMTP login. Use a Google App Password with 2-Step Verification enabled, and keep SMTP_FROM set to the same Gmail address.",
      );
    }

    throw error instanceof Error ? error : new Error("Unable to send reset email");
  }
}
