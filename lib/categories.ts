/** Catégories communes (recherche, création d’annonce, etc.) */
export const POST_CATEGORIES = [
  "Développement",
  "Design",
  "Marketing",
  "Ventes",
  "Consulting",
  "Autre",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
