import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

export const OTP_EMAIL_FROM = process.env.OTP_EMAIL_FROM;
export const OTP_EMAIL_SUBJECT = process.env.OTP_EMAIL_SUBJECT ?? 'Your ZingBrokers verification code';
export const OTP_EMAIL_TEXT_TEMPLATE =
  process.env.OTP_EMAIL_TEXT_TEMPLATE ??
  'Your ZingBrokers verification code is {CODE}. It expires in 10 minutes.';
export const OTP_DEV_CONSOLE_FALLBACK = process.env.OTP_DEV_CONSOLE_FALLBACK === 'true';

export const transporter = SMTP_HOST && SMTP_PORT && OTP_EMAIL_FROM
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER && SMTP_PASS
        ? { user: SMTP_USER, pass: SMTP_PASS }
        : undefined,
    })
  : null;
