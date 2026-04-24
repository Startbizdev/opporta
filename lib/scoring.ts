interface ScoringParams {
  budgetDefined: boolean;
  completeness: number; // 0-1
  engagement: number; // nombre de replies
  ageInHours: number;
}

export function calculateScore({
  budgetDefined,
  completeness,
  engagement,
  ageInHours,
}: ScoringParams): number {
  const maxAge = 7 * 24; // 7 jours
  const recency = Math.max(0, 1 - ageInHours / maxAge);

  const score =
    (budgetDefined ? 2 : 0) +
    recency * 1 +
    completeness * 2 +
    engagement * 1;

  return Math.round(score * 100) / 100;
}

export function calculatePostCompleteness(post: {
  title?: string;
  description?: string;
  category?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
}): number {
  const fields = [
    !!post.title,
    !!post.description && post.description.length >= 50,
    !!post.category,
    !!(post.budgetMin && post.budgetMax),
    !!post.location,
  ];
  return fields.filter(Boolean).length / fields.length;
}
