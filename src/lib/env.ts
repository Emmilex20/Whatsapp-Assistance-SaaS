const requiredServerEnv = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_SEND_ENABLED",
];

export function validateEnv() {
  const missing = requiredServerEnv.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getEnvStatus() {
  return requiredServerEnv.map((key) => ({
    key,
    configured: Boolean(process.env[key]),
  }));
}
