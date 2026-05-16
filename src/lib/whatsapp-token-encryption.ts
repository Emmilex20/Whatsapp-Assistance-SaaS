import crypto from "crypto";

type EncryptedToken = {
  encrypted: string;
  iv: string;
  tag: string;
};

function getEncryptionKey() {
  const secret = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;

  if (!secret) return null;

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptWhatsAppToken(token: string): EncryptedToken | null {
  const key = getEncryptionKey();

  if (!key) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptWhatsAppToken({
  encrypted,
  iv,
  tag,
}: EncryptedToken) {
  const key = getEncryptionKey();

  if (!key) return null;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
