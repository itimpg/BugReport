import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer {
  const hex = process.env.IMAGE_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("IMAGE_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

// Encrypted layout: [ IV: 12 bytes ][ AuthTag: 16 bytes ][ Ciphertext: N bytes ]
export function encryptBuffer(data: Buffer): Buffer {
  const key    = getKey();
  const iv     = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag   = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

export function decryptBuffer(data: Buffer): Buffer {
  const key       = getKey();
  const iv        = data.subarray(0, 12);
  const authTag   = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher  = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
