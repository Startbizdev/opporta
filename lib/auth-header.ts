/** En-tête attendu par les routes API (e-mail ou id Prisma). */
export function getClientAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const id = localStorage.getItem("userId");
  const email = localStorage.getItem("user");
  const v = id || email || "";
  return v ? { "x-user-id": v } : {};
}
