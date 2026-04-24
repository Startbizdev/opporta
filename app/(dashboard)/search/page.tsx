"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedPostSkeleton } from "@/components/feed/FeedPostSkeleton";
import {
  SearchFiltersBar,
  SearchFiltersForm,
  countActiveSearchFilters,
  type SearchFiltersState,
} from "@/components/search/SearchFiltersBar";

interface Post {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
  createdAt: Date;
}

const emptyFilters: SearchFiltersState = {
  type: "",
  category: "",
  minBudget: "",
  maxBudget: "",
  location: "",
};

export default function SearchPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>(emptyFilters);

  const activeCount = useMemo(
    () => countActiveSearchFilters(filters),
    [filters]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.type) params.append("type", filters.type);
        if (filters.category) params.append("category", filters.category);
        if (filters.minBudget) params.append("minBudget", filters.minBudget);
        if (filters.maxBudget) params.append("maxBudget", filters.maxBudget);

        const response = await fetch(`/api/posts?${params.toString()}`);
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPosts, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="flex flex-col md:block">
      {/* Deuxième sidebar : collée au bord droit de la nav (left-56), pleine hauteur viewport */}
      <aside
        className="relative hidden md:fixed md:bottom-0 md:left-56 md:top-0 md:z-20 md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-shell"
        aria-label="Filtres de recherche"
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-90"
          aria-hidden
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2.5 pb-8 pt-8 md:pr-5">
          <div className="mb-4 flex items-baseline justify-between gap-2 px-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary/90">
              Filtres
            </p>
            {activeCount > 0 ? (
              <span className="tabular-nums text-[10px] font-medium text-accent-ink">
                {activeCount}
              </span>
            ) : null}
          </div>
          <SearchFiltersForm
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(emptyFilters)}
            showResetButton
            variant="sidebar"
          />
        </div>
      </aside>

      <div className="md:hidden">
        <SearchFiltersBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
        />
      </div>

      {/* Contenu : décalé de la largeur du rail filtres (même largeur que la nav : w-56) */}
      <div className="min-w-0 md:pl-56 md:pr-2">
        <div className="max-w-3xl">
          {loading ? (
            <div
              className="grid gap-4"
              aria-busy="true"
              aria-label="Recherche en cours"
            >
              <FeedPostSkeleton />
              <FeedPostSkeleton />
              <FeedPostSkeleton />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  type={post.type}
                  title={post.title}
                  description={post.description}
                  category={post.category}
                  budgetMin={post.budgetMin}
                  budgetMax={post.budgetMax}
                  location={post.location}
                  createdAt={new Date(post.createdAt)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-notion border border-border bg-field">
              <EmptyState
                icon={Search}
                title="Aucun résultat avec ces critères"
                description="Élargissez les filtres ou réinitialisez-les pour voir plus d’annonces."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setFilters(emptyFilters)}
                  >
                    Réinitialiser les filtres
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
