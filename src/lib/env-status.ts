const requiredProductionEnv = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_SEND_ENABLED",
  "OPENAI_API_KEY",
  "AI_RESPONSES_ENABLED",
  "AI_UPSELLS_ENABLED",
  "VOICE_TRANSCRIPTION_ENABLED",
  "AI_PROVIDER",
  "AI_MODEL",
  "MEDIA_GENERATION_ENABLED",
];

const optionalProductionEnv = [
  "REPLICATE_API_TOKEN",
  "REPLICATE_IMAGE_MODEL",
  "REPLICATE_TEXT_MODEL",
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_PUBLIC_KEY",
  "PAYSTACK_WEBHOOK_SECRET",
];

export function getProductionEnvStatus() {
  return {
    required: requiredProductionEnv.map((key) => ({
      key,
      configured: Boolean(process.env[key]),
      value:
        key.includes("ENABLED") ||
        key.includes("PROVIDER") ||
        key.includes("MODEL")
          ? process.env[key] || ""
          : "",
    })),
    optional: optionalProductionEnv.map((key) => ({
      key,
      configured: Boolean(process.env[key]),
      value: key.includes("MODEL") ? process.env[key] || "" : "",
    })),
  };
}
