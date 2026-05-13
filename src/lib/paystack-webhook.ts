import { createHmac, timingSafeEqual } from "crypto";

export function verifyPaystackSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string | null;
}) {
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return false;
  }

  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (hashBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, signatureBuffer);
}
