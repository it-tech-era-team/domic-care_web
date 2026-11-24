import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM_EMAIL = SMTP_USER || "support@domiccare.com";
const SMTP_FROM_NAME = "DomicCare Support";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://domiccare.com";

/**
 * Creates or retrieves the Nodemailer transporter.
 * If SMTP credentials are not yet configured, returns null to trigger safe preview mode.
 */
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Resolves the logo file path for CID embedding so images display 100% reliably in Gmail/Outlook
 * without requiring external hosting or breaking on localhost.
 */
function getLogoAttachment(): { filename: string; path: string; cid: string } | null {
  const possiblePaths = [
    path.join(process.cwd(), "public", "domic_care_logo_without_text-removebg-preview.png"),
    path.join(process.cwd(), "web", "domic-care_web", "public", "domic_care_logo_without_text-removebg-preview.png"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return {
        filename: "domiccare-logo.png",
        path: p,
        cid: "domiccare_logo",
      };
    }
  }
  return null;
}

/**
 * Shared Email Shell with the redesigned compact white header, 4px top gradient stripe,
 * and high-contrast DomicCare logo.
 */
function renderEmailShell({
  badgeText,
  badgeBg = "#eff6ff",
  badgeColor = "#1d4ed8",
  badgeBorder = "none",
  contentHtml,
}: {
  badgeText: string;
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  contentHtml: string;
}) {
  const hasLocalAttachment = !!getLogoAttachment();
  const logoSrc = hasLocalAttachment ? "cid:domiccare_logo" : `${APP_URL}/domic_care_logo_without_text-removebg-preview.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DomicCare</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 32px 0; }
    .main-table { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05); }
    .top-accent-bar { height: 4px; background: linear-gradient(90deg, #1d4ed8, #3b82f6, #06b6d4); }
    .header { padding: 20px 28px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; }
    .header-table { width: 100%; }
    .logo-img { height: 38px; width: 38px; object-fit: contain; vertical-align: middle; }
    .brand-text { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; display: inline-block; margin-left: 8px; }
    .brand-accent { color: #2563eb; }
    .header-badge { display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; border: ${badgeBorder}; }
    .content { padding: 30px 28px; line-height: 1.6; }
    .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 22px 0; }
    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 10px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
    .footer { background-color: #fafafa; border-top: 1px solid #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="top-accent-bar"></td>
      </tr>
      <tr>
        <td class="header">
          <table class="header-table" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="left" style="vertical-align: middle;">
                <img src="${logoSrc}" alt="DomicCare Logo" class="logo-img" width="38" height="38" style="height: 38px; width: 38px; object-fit: contain; vertical-align: middle; border: 0;" />
                <span class="brand-text">Domic<span class="brand-accent">Care</span></span>
              </td>
              <td align="right" style="vertical-align: middle;">
                <span class="header-badge">${badgeText}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${contentHtml}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px;">Need assistance? Contact our care team at <a href="mailto:support@domiccare.com">support@domiccare.com</a></p>
          <p style="margin: 0;">&copy; 2026 DomicCare OOD. Sofia, Bulgaria. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Dispatch an email with safe fallback to console preview if SMTP secrets are not yet configured.
 */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n================================================================`);
    console.log(`📨 [Nodemailer Preview Mode - SMTP credentials pending in .env.local]`);
    console.log(`To:      ${to}`);
    console.log(`From:    "${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`);
    console.log(`Subject: ${subject}`);
    console.log(`================================================================\n`);
    return { success: true, previewMode: true };
  }

  try {
    const formattedFrom = `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`;
    const generatedMessageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@domiccare.com>`;
    const logoAttachment = getLogoAttachment();
    const attachments = logoAttachment ? [logoAttachment] : [];

    const info = await transporter.sendMail({
      from: formattedFrom,
      sender: SMTP_FROM_EMAIL,
      replyTo: SMTP_FROM_EMAIL,
      to,
      subject,
      html,
      messageId: generatedMessageId,
      attachments,
    });
    console.log(`[Nodemailer Dispatch SUCCESS] ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Nodemailer Dispatch ERROR] Failed to send email to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Email dispatch failed" };
  }
}

/**
 * 1. Signup Welcome Email
 */
export async function sendWelcomeEmail({
  to,
  fullName,
  roleTitle = "Family Member",
  loginUrl = `${APP_URL}/login`,
}: {
  to: string;
  fullName: string;
  roleTitle?: string;
  loginUrl?: string;
}) {
  const contentHtml = `
    <div class="greeting">Welcome aboard, ${fullName}! 👋</div>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">
      Thank you for registering on <strong>DomicCare</strong> — Bulgaria's premier compassionate caregiving network. Your account (${roleTitle}) is ready.
    </p>
    <div class="card">
      <div class="card-title">Quick steps to get started:</div>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.65;">
        <li style="margin-bottom: 6px;">Browse verified, background-checked caregivers across Sofia, Pleven, and throughout Bulgaria.</li>
        <li style="margin-bottom: 6px;">Schedule hourly or daily elder care, companion assistance, or specialized nursing.</li>
        <li style="margin-bottom: 0;">Directly chat and track all appointments on your personal dashboard.</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 28px 0 12px;">
      <a href="${loginUrl}" class="button" target="_blank">Access Your Dashboard &rarr;</a>
    </div>
  `;

  const html = renderEmailShell({
    badgeText: "Welcome",
    badgeBg: "#eff6ff",
    badgeColor: "#1d4ed8",
    contentHtml,
  });

  return sendEmail({
    to,
    subject: `Welcome to DomicCare, ${fullName}! 🎉`,
    html,
  });
}

/**
 * 2. Password Reset Email
 */
export async function sendPasswordResetEmail({
  to,
  fullName = "User",
  resetUrl,
}: {
  to: string;
  fullName?: string;
  resetUrl: string;
}) {
  const contentHtml = `
    <div class="greeting">Password Reset Request</div>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">
      Hello ${fullName}, we received a request to reset the password for your DomicCare account (<strong>${to}</strong>).
    </p>
    <div style="text-align: center; margin: 26px 0;">
      <a href="${resetUrl}" class="button" target="_blank">Reset My Password &rarr;</a>
    </div>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #92400e;">
      ⏰ <strong>Expiry Notice:</strong> This reset link is active for <strong>60 seconds</strong> for your security. If the link has elapsed, please request a fresh reset link from the forgot password page.
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">
      Button not working? Copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  const html = renderEmailShell({
    badgeText: "Security",
    badgeBg: "#fef2f2",
    badgeColor: "#b91c1c",
    contentHtml,
  });

  return sendEmail({
    to,
    subject: `Reset Your DomicCare Password 🔐`,
    html,
  });
}

/**
 * 3. Booking & Payment Confirmation Email
 */
export async function sendBookingConfirmationEmail({
  to,
  userName,
  caregiverName,
  serviceName,
  appointmentDateTime,
  location,
  caregiverPayout,
  platformFee,
  totalAmount,
  bookingId,
  dashboardUrl = `${APP_URL}/user/bookings`,
}: {
  to: string;
  userName: string;
  caregiverName: string;
  serviceName: string;
  appointmentDateTime: string;
  location: string;
  caregiverPayout: number | string;
  platformFee: number | string;
  totalAmount: number | string;
  bookingId: string;
  dashboardUrl?: string;
}) {
  const contentHtml = `
    <div class="greeting">Appointment Confirmed! 🎉</div>
    <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">
      Thank you, ${userName}. Your booking and payment have been successfully processed. Here is your receipt summary:
    </p>

    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-top: 22px; margin-bottom: 10px;">
      Appointment Summary
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 18px;">
      <tr>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #64748b; font-weight: 600; width: 38%;">Booking ID</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 700;">#${bookingId.slice(0, 8).toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #64748b; font-weight: 600;">Caregiver</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 700;">${caregiverName} ⭐ Verified</td>
      </tr>
      <tr>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #64748b; font-weight: 600;">Service</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 700;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #64748b; font-weight: 600;">Date & Time</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 700;">${appointmentDateTime}</td>
      </tr>
      <tr>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #64748b; font-weight: 600;">Care Location</td>
        <td style="padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; font-weight: 700;">${location}</td>
      </tr>
    </table>

    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-top: 22px; margin-bottom: 10px;">
      Payment Breakdown (USD)
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin: 18px 0;">
      <tr>
        <td style="padding: 5px 12px; color: #475569; font-size: 13.5px;">Caregiver Service Fee:</td>
        <td style="padding: 5px 12px; text-align: right; font-weight: 600; font-size: 13.5px;">$${Number(caregiverPayout).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 5px 12px; color: #475569; font-size: 13.5px;">Platform Service Fee (12%):</td>
        <td style="padding: 5px 12px; text-align: right; font-weight: 600; font-size: 13.5px;">$${Number(platformFee).toFixed(2)}</td>
      </tr>
      <tr style="border-top: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px 5px; color: #0f172a; font-weight: 800; font-size: 15px;">Total Paid:</td>
        <td style="padding: 10px 12px 5px; text-align: right; color: #2563eb; font-weight: 800; font-size: 17px;">$${Number(totalAmount).toFixed(2)}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 26px 0 10px;">
      <a href="${dashboardUrl}" class="button" target="_blank">View Booking in Portal &rarr;</a>
    </div>
  `;

  const html = renderEmailShell({
    badgeText: "✔ Paid & Booked",
    badgeBg: "#ecfdf5",
    badgeColor: "#059669",
    badgeBorder: "1px solid #a7f3d0",
    contentHtml,
  });

  return sendEmail({
    to,
    subject: `Booking Confirmed & Payment Receipt: $${Number(totalAmount).toFixed(2)} - ${serviceName} ✅`,
    html,
  });
}
