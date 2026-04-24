"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Euro,
  FileQuestion,
  MapPin,
  Send,
} from "lucide-react";
import { getClientAuthHeader } from "@/lib/auth-header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

interface Post {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string | null;
  createdAt: string;
  user: { username: string };
}

function PostDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-4"
      aria-busy="true"
      aria-label="Chargement de l’annonce"
    >
      <Skeleton className="h-4 w-28" />
      <div className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex justify-between gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mb-4 h-8 max-w-[90%]" />
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="space-y-2 border-t border-border/60 pt-6">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 max-w-[80%]" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-28 w-full rounded-notion" />
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string) {
  const t = new Date().getTime() - new Date(iso).getTime();
  const hours = Math.floor(t / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} j`;
  if (hours > 0) return `${hours} h`;
  return "À l’instant";
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [message, setMessage] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [lastConversationId, setLastConversationId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setReplySent(false);
      setLastConversationId(null);
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          if (!cancelled) setPost(null);
          return;
        }
        const data = await response.json();
        if (!cancelled) setPost(data);
      } catch (error) {
        console.error("Error:", error);
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) void fetchPost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplying(true);

    try {
      const response = await fetch(`/api/posts/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getClientAuthHeader(),
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (response.ok) {
        setMessage("");
        setReplySent(true);
        const data = await response.json().catch(() => ({}));
        const convId =
          data?.conversation?.id && typeof data.conversation.id === "string"
            ? data.conversation.id
            : null;
        setLastConversationId(convId);

        toast.success("Réponse envoyée", {
          description: "Vous pouvez poursuivre dans la messagerie.",
          action: {
            label: "Ouvrir",
            onClick: () =>
              router.push(
                convId ? `/messages?conversation=${convId}` : "/messages"
              ),
          },
        });
        return;
      }

      let errMsg = "Impossible d’envoyer la réponse";
      try {
        const b = await response.json();
        if (typeof b.error === "string") errMsg = b.error;
      } catch {
        /* ignore */
      }
      toast.error(errMsg);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur réseau");
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-notion border border-border bg-field">
          <EmptyState
            icon={FileQuestion}
            title="Annonce introuvable"
            description="Ce contenu n’existe plus ou l’identifiant est invalide."
            action={
              <Button variant="secondary" onClick={() => router.back()}>
                Retour
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const isRequest = post.type === "REQUEST";
  const hasBudget =
    post.budgetMin != null &&
    post.budgetMax != null &&
    post.budgetMin > 0 &&
    post.budgetMax > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.12em] text-text-tertiary transition-colors hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ChevronLeft className="size-3.5 opacity-80" strokeWidth={1.75} />
        Fil
      </Link>

      <article className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm sm:p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              type={isRequest ? "Demande" : "Offre"}
              variant={isRequest ? "warning" : "success"}
            />
            <time
              className="text-2xs font-medium tabular-nums text-text-tertiary"
              dateTime={post.createdAt}
            >
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>
          <p className="text-2xs text-text-secondary">
            <span className="font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Par{" "}
            </span>
            <span className="font-medium text-text-primary">
              {post.user.username}
            </span>
          </p>
        </header>

        <h1 className="mb-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {post.title}
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-notion border border-border bg-field px-2.5 py-1 text-2xs font-medium text-text-secondary">
            {post.category}
          </span>
          {post.location ? (
            <span className="inline-flex items-center gap-1 rounded-notion border border-border bg-field px-2.5 py-1 text-2xs font-medium text-text-secondary">
              <MapPin
                className="size-3 text-text-tertiary"
                strokeWidth={1.75}
              />
              {post.location}
            </span>
          ) : null}
        </div>

        {hasBudget ? (
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold tabular-nums text-foreground">
            <Euro className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
            <span>
              {post.budgetMin!.toLocaleString("fr-FR")} —{" "}
              {post.budgetMax!.toLocaleString("fr-FR")} €
            </span>
          </div>
        ) : null}

        <div className="border-t border-border/60 pt-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/90">
            Description
          </p>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {post.description}
          </p>
        </div>
      </article>

      <section className="rounded-lg border border-border bg-surface-raised p-6 shadow-sm sm:p-8">
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary/90">
            Répondre
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Un message court et concret augmente vos chances d’échange.{" "}
            <span className="text-text-tertiary">1 crédit par envoi.</span>
          </p>
        </div>

        {replySent ? (
          <div className="rounded-notion border border-border bg-field px-4 py-5 text-center">
            <p className="text-sm font-medium text-foreground">
              Message envoyé
            </p>
            <p className="mt-1 text-2xs text-text-secondary">
              Poursuivez la discussion depuis la messagerie.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                variant="primary"
                className="sm:w-auto"
                onClick={() =>
                  router.push(
                    lastConversationId
                      ? `/messages?conversation=${lastConversationId}`
                      : "/messages"
                  )
                }
              >
                Ouvrir les messages
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="sm:w-auto"
                onClick={() => {
                  setReplySent(false);
                  setLastConversationId(null);
                }}
              >
                Nouveau message
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReply} className="space-y-4">
            <div>
              <label
                htmlFor="reply"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/90"
              >
                Votre message
              </label>
              <Textarea
                id="reply"
                placeholder="Présentez votre proposition ou votre besoin complémentaire…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={1}
                maxLength={1000}
                className="min-h-[8.5rem] bg-field"
              />
              <p className="mt-1.5 text-2xs tabular-nums text-text-tertiary">
                {message.length}/1000
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/80 pt-5 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="sm:w-auto"
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={replying || !message.trim()}
                className="sm:min-w-[9rem]"
              >
                <Send className="size-4" strokeWidth={1.65} />
                {replying ? "Envoi…" : "Envoyer"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
