import { randomBytes, scryptSync } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":", 2);
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return derivedKey === key;
}
