"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { getClientAuthHeader } from "@/lib/auth-header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/Textarea";
import { type PostCategory, POST_CATEGORIES } from "@/lib/categories";

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/90"
      >
        {children}
      </label>
      {hint ? (
        <span className="text-2xs tabular-nums text-text-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}

export type CreatePostFormProps = {
  /** Synchronisé avec le sélecteur du composer (fil) */
  initialType?: "REQUEST" | "OFFER";
  /** Fermeture modale / sheet */
  onCancel?: () => void;
  /** Si défini : pas de redirection vers la fiche (ex. publication depuis le fil) */
  onPosted?: (post: { id: string }) => void;
  /** Densité visuelle */
  density?: "comfortable" | "compact";
};

export function CreatePostForm({
  initialType = "REQUEST",
  onCancel,
  onPosted,
  density = "comfortable",
}: CreatePostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"REQUEST" | "OFFER">(initialType);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: PostCategory;
    budgetMin: string;
    budgetMax: string;
    location: string;
  }>({
    title: "",
    description: "",
    category: POST_CATEGORIES[0],
    budgetMin: "",
    budgetMax: "",
    location: "",
  });

  const sectionGap = density === "compact" ? "space-y-4" : "space-y-6";
  const typeBlockMb = density === "compact" ? "mb-5" : "mb-8";
  const textareaMin = density === "compact" ? "min-h-[8rem]" : "min-h-[10rem]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getClientAuthHeader(),
        },
        body: JSON.stringify({
          type,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          budgetMin: formData.budgetMin
            ? parseInt(formData.budgetMin, 10)
            : undefined,
          budgetMax: formData.budgetMax
            ? parseInt(formData.budgetMax, 10)
            : undefined,
          location: formData.location || undefined,
        }),
      });

      if (response.ok) {
        const post = await response.json();
        toast.success("Annonce publiée", {
          description: onPosted
            ? "Elle apparaît dans le fil."
            : "Redirection vers la fiche…",
        });
        if (onPosted) onPosted(post);
        else router.push(`/post/${post.id}`);
        return;
      }

      let message = "Impossible de publier l’annonce";
      try {
        const errBody = await response.json();
        if (typeof errBody.error === "string") message = errBody.error;
        else if (Array.isArray(errBody.error))
          message =
            errBody.error
              .map((i: { message?: string }) => i.message)
              .filter(Boolean)
              .join(", ") || message;
      } catch {
        /* ignore */
      }
      toast.error(message);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur réseau", {
        description: "Vérifiez votre connexion et réessayez.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

  return (
    <div>
      <div className={typeBlockMb}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary/90">
          Type d’annonce
        </p>
        <div className="grid grid-cols-2 gap-1 rounded-notion border border-border bg-field p-1">
          <button
            type="button"
            onClick={() => setType("REQUEST")}
            className={`relative flex items-center justify-center gap-2 rounded-notion px-3 py-3 text-[13px] font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-field ${
              type === "REQUEST"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-text-secondary hover:bg-overlay-subtle hover:text-text-primary"
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full transition-colors ${
                type === "REQUEST" ? "bg-accent-ink" : "bg-transparent"
              }`}
              aria-hidden
            />
            <ArrowDownLeft
              className={`size-4 shrink-0 ${
                type === "REQUEST" ? "text-accent-ink" : "opacity-70"
              }`}
              strokeWidth={1.65}
            />
            Je cherche
          </button>
          <button
            type="button"
            onClick={() => setType("OFFER")}
            className={`relative flex items-center justify-center gap-2 rounded-notion px-3 py-3 text-[13px] font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-field ${
              type === "OFFER"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-text-secondary hover:bg-overlay-subtle hover:text-text-primary"
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full transition-colors ${
                type === "OFFER" ? "bg-accent-ink" : "bg-transparent"
              }`}
              aria-hidden
            />
            <ArrowUpRight
              className={`size-4 shrink-0 ${
                type === "OFFER" ? "text-accent-ink" : "opacity-70"
              }`}
              strokeWidth={1.65}
            />
            J’offre
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={sectionGap}>
        <div>
          <FieldLabel
            htmlFor="create-title"
            hint={`${formData.title.length}/10 min.`}
          >
            Titre
          </FieldLabel>
          <Input
            id="create-title"
            placeholder="Ex. Refonte site vitrine + blog"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            minLength={10}
            className="bg-field"
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="create-description"
            hint={`${formData.description.length}/50 min.`}
          >
            Description
          </FieldLabel>
          <Textarea
            id="create-description"
            placeholder="Contexte, contraintes, livrables, délais…"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            minLength={50}
            className={`${textareaMin} bg-field`}
          />
        </div>

        <div className="border-t border-border/60 pt-6">
          <FieldLabel htmlFor="create-category">Catégorie</FieldLabel>
          <Select
            value={formData.category}
            onValueChange={(v) => {
              const next = POST_CATEGORIES.find((c) => c === v);
              if (next) setFormData({ ...formData, category: next });
            }}
          >
            <SelectTrigger id="create-category" className="w-full bg-field">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {POST_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-border/60 pt-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary/90">
            Budget indicatif
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="create-budgetMin">Minimum (€)</FieldLabel>
              <Input
                id="create-budgetMin"
                type="number"
                placeholder="1 000"
                value={formData.budgetMin}
                onChange={(e) =>
                  setFormData({ ...formData, budgetMin: e.target.value })
                }
                className="bg-field"
              />
            </div>
            <div>
              <FieldLabel htmlFor="create-budgetMax">Maximum (€)</FieldLabel>
              <Input
                id="create-budgetMax"
                type="number"
                placeholder="5 000"
                value={formData.budgetMax}
                onChange={(e) =>
                  setFormData({ ...formData, budgetMax: e.target.value })
                }
                className="bg-field"
              />
            </div>
          </div>
          <p className="mt-3 text-2xs leading-relaxed text-text-tertiary">
            Facultatif — laissez vide si vous préférez en discuter en message.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="create-location">Localisation</FieldLabel>
          <Input
            id="create-location"
            placeholder="Paris, France"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="bg-field"
          />
          <p className="mt-1.5 text-2xs text-text-tertiary">Optionnel</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/80 pt-6 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="sm:min-w-[8.5rem]"
          >
            {loading ? "Publication…" : "Publier"}
          </Button>
        </div>
      </form>
    </div>
  );
}
