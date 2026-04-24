"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rss } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { FeedComposer } from "@/components/feed/FeedComposer";
import { FeedPostSkeleton } from "@/components/feed/FeedPostSkeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { encodeFeedCursor, type FeedCursor } from "@/lib/feed-cursor";

type FeedPost = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string | null;
  createdAt: string;
};

type FeedPagePayload = {
  posts: FeedPost[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
};

async function fetchFeedPage(
  pageParam: FeedCursor | undefined
): Promise<FeedPagePayload> {
  const params = new URLSearchParams({ limit: "20" });
  if (pageParam) params.set("cursor", encodeFeedCursor(pageParam));
  const res = await fetch(`/api/posts/feed?${params}`);
  if (!res.ok) throw new Error("Impossible de charger le fil");
  return res.json();
}

export default function FeedPage() {
  const queryClient = useQueryClient();
  const [composeOpen, setComposeOpen] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    initialPageParam: undefined as FeedCursor | undefined,
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor
        ? lastPage.nextCursor
        : undefined,
  });

  const posts = useMemo(() => {
    const seen = new Set<string>();
    const out: FeedPost[] = [];
    for (const page of data?.pages ?? []) {
      for (const p of page.posts) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        out.push(p);
      }
    }
    return out;
  }, [data]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const tryFetchNext = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || fetchingRef.current) return;
    fetchingRef.current = true;
    void fetchNextPage().finally(() => {
      fetchingRef.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    let debounceT: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (debounceT) clearTimeout(debounceT);
        debounceT = setTimeout(() => {
          debounceT = null;
          tryFetchNext();
        }, 80);
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => {
      if (debounceT) clearTimeout(debounceT);
      observer.disconnect();
    };
  }, [tryFetchNext]);

  if (isPending) {
    return (
      <div className="grid gap-4">
        <FeedComposer
          open={composeOpen}
          onOpenChange={setComposeOpen}
          onPosted={() => {
            void queryClient.invalidateQueries({ queryKey: ["feed"] });
          }}
        />
        <FeedPostSkeleton />
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-notion border border-danger/30 bg-danger-muted px-4 py-8 text-center text-sm text-foreground">
        {error instanceof Error ? error.message : "Erreur réseau"}
      </div>
    );
  }

  return (
    <div>
      <FeedComposer
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onPosted={() => {
          void queryClient.invalidateQueries({ queryKey: ["feed"] });
        }}
      />
      <div className="mt-4 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <div className="rounded-notion border border-border bg-field">
            <EmptyState
              icon={Rss}
              title="Aucune opportunité pour l’instant"
              description="Publiez une demande ou une offre pour lancer le fil."
              action={
                <Button
                  variant="primary"
                  onClick={() => setComposeOpen(true)}
                >
                  Nouvelle annonce
                </Button>
              }
            />
          </div>
        )}
      </div>

      {posts.length > 0 ? (
        <>
          <div
            ref={sentinelRef}
            className="h-4 w-full shrink-0"
            aria-hidden
          />
          {isFetchingNextPage ? (
            <div className="mt-4 grid w-full gap-4 py-6">
              <FeedPostSkeleton />
              <FeedPostSkeleton />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
