import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUsernamePart(local: string): string {
  const t = local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
  return t.length >= 2 ? t : `u_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureCreditBalance(userId: string): Promise<void> {
  await prisma.creditBalance.upsert({
    where: { userId },
    create: { userId, amount: 3 },
    update: {},
  });
}

/**
 * Crée l'utilisateur (e-mail) + solde crédits si absent.
 * À utiliser après login démo / magic link.
 */
export async function ensureUserByEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    await ensureCreditBalance(existing.id);
    return existing.id;
  }

  const base = sanitizeUsernamePart(normalized.split("@")[0] || "user");
  for (let i = 0; i < 100; i++) {
    const username = i === 0 ? base : `${base}${i}`;
    try {
      const user = await prisma.user.create({
        data: {
          email: normalized,
          username,
          creditBalance: { create: { amount: 3 } },
        },
        select: { id: true },
      });
      return user.id;
    } catch {
      continue;
    }
  }
  throw new Error("Impossible de provisionner l'utilisateur");
}

/**
 * Résout l'en-tête client (e-mail ou id Prisma) vers un `userId` valide.
 */
export async function resolveSessionUserId(
  header: string | null
): Promise<string | null> {
  if (!header?.trim()) return null;
  const v = header.trim();

  if (EMAIL_RE.test(v)) {
    try {
      return await ensureUserByEmail(v.trim());
    } catch {
      return null;
    }
  }

  const byId = await prisma.user.findUnique({
    where: { id: v },
    select: { id: true },
  });
  if (byId) {
    await ensureCreditBalance(byId.id);
    return byId.id;
  }

  return null;
}
