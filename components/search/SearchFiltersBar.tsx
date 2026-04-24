"use client";

import { useId, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RangeSlider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { POST_CATEGORIES } from "@/lib/categories";

export const SEARCH_BUDGET_MIN = 0;
export const SEARCH_BUDGET_MAX = 50_000;
export const SEARCH_BUDGET_STEP = 500;

export type SearchFiltersState = {
  type: string;
  category: string;
  minBudget: string;
  maxBudget: string;
  location: string;
};

const TYPE_ALL = "__all__";
const CAT_ALL = "__all__";

function formatEur(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function clampBudget(n: number) {
  return Math.min(
    SEARCH_BUDGET_MAX,
    Math.max(
      SEARCH_BUDGET_MIN,
      Math.round(n / SEARCH_BUDGET_STEP) * SEARCH_BUDGET_STEP
    )
  );
}

export function countActiveSearchFilters(filters: SearchFiltersState): number {
  let n = 0;
  if (filters.type) n++;
  if (filters.category) n++;
  if (filters.minBudget || filters.maxBudget) n++;
  return n;
}

/** Formulaire de filtres — `variant="sidebar"` : pile verticale (rail PC). */
export function SearchFiltersForm({
  filters,
  onChange,
  onReset,
  showResetButton,
  variant = "inline",
}: {
  filters: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
  onReset: () => void;
  showResetButton: boolean;
  variant?: "inline" | "sidebar";
}) {
  const uid = useId();
  const typeId = `${uid}-type`;
  const catId = `${uid}-category`;
  const stack = variant === "sidebar";

  const budgetRange = useMemo((): [number, number] => {
    if (!filters.minBudget && !filters.maxBudget) {
      return [SEARCH_BUDGET_MIN, SEARCH_BUDGET_MAX];
    }
    const lo = filters.minBudget
      ? clampBudget(Number(filters.minBudget))
      : SEARCH_BUDGET_MIN;
    const hi = filters.maxBudget
      ? clampBudget(Number(filters.maxBudget))
      : SEARCH_BUDGET_MAX;
    if (Number.isNaN(lo) || Number.isNaN(hi)) {
      return [SEARCH_BUDGET_MIN, SEARCH_BUDGET_MAX];
    }
    return lo <= hi ? [lo, hi] : [hi, lo];
  }, [filters.minBudget, filters.maxBudget]);

  const isFullBudgetRange =
    budgetRange[0] <= SEARCH_BUDGET_MIN &&
    budgetRange[1] >= SEARCH_BUDGET_MAX;

  const labelClass = stack
    ? "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary/90"
    : "mb-1.5 block text-2xs font-medium uppercase tracking-wide text-text-tertiary";

  return (
    <div
      className={
        stack
          ? "flex flex-col gap-5"
          : "flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end"
      }
    >
      <div className={`w-full shrink-0 ${stack ? "" : "lg:w-[12rem]"}`}>
        <label htmlFor={typeId} className={labelClass}>
          Type
        </label>
        <Select
          value={filters.type || TYPE_ALL}
          onValueChange={(v) =>
            onChange({
              ...filters,
              type: v === TYPE_ALL ? "" : v,
            })
          }
        >
          <SelectTrigger id={typeId} className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TYPE_ALL}>Tous</SelectItem>
            <SelectItem value="REQUEST">Demandes</SelectItem>
            <SelectItem value="OFFER">Offres</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={`min-w-0 w-full shrink-0 ${stack ? "" : "lg:w-[14rem]"}`}>
        <label htmlFor={catId} className={labelClass}>
          Catégorie
        </label>
        <Select
          value={filters.category || CAT_ALL}
          onValueChange={(v) =>
            onChange({
              ...filters,
              category: v === CAT_ALL ? "" : v,
            })
          }
        >
          <SelectTrigger id={catId} className="w-full">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CAT_ALL}>Toutes</SelectItem>
            {POST_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`min-w-0 w-full ${stack ? "" : "flex-1 lg:min-w-[min(100%,18rem)]"}`}
      >
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label className={labelClass}>Budget</label>
          <span className="tabular-nums text-2xs text-text-secondary">
            {isFullBudgetRange ? (
              <>Toute enveloppe</>
            ) : (
              <>
                {formatEur(budgetRange[0])} — {formatEur(budgetRange[1])}
              </>
            )}
          </span>
        </div>
        <RangeSlider
          min={SEARCH_BUDGET_MIN}
          max={SEARCH_BUDGET_MAX}
          step={SEARCH_BUDGET_STEP}
          value={budgetRange}
          onValueChange={([lo, hi]) => {
            const full = lo <= SEARCH_BUDGET_MIN && hi >= SEARCH_BUDGET_MAX;
            onChange({
              ...filters,
              minBudget: full ? "" : String(lo),
              maxBudget: full ? "" : String(hi),
            });
          }}
          className="pt-1"
        />
        <div className="mt-1 flex justify-between text-2xs text-text-tertiary">
          <span>{formatEur(SEARCH_BUDGET_MIN)}</span>
          <span>{formatEur(SEARCH_BUDGET_MAX)}</span>
        </div>
      </div>

      {showResetButton ? (
        <div
          className={`flex w-full shrink-0 ${stack ? "" : "lg:w-auto lg:pb-0.5"}`}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            className={`w-full ${stack ? "" : "lg:w-auto"}`}
          >
            Réinitialiser
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Bandeau + sheet filtres — mobile uniquement (le PC utilise le rail dans la page). */
export function SearchFiltersBar({
  filters,
  onChange,
  onReset,
}: {
  filters: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
  onReset: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = useMemo(() => countActiveSearchFilters(filters), [filters]);

  return (
    <div
      className="sticky top-14 z-20 mb-8 md:hidden"
      role="search"
      aria-label="Filtres de recherche"
    >
      <div className="-mx-4 border-b border-border bg-shell/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-shell/90 sm:-mx-6 sm:px-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              className="h-10 min-h-10 flex-1 gap-2 px-4"
            >
              <SlidersHorizontal
                className="size-4 shrink-0 text-text-tertiary"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="font-medium">Filtres</span>
              {activeCount > 0 ? (
                <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-accent-muted px-2 py-0.5 text-2xs font-semibold tabular-nums text-accent-ink">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
              <SheetDescription>
                Ajustez les critères — les résultats se mettent à jour tout de
                suite.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
              <SearchFiltersForm
                filters={filters}
                onChange={onChange}
                onReset={onReset}
                showResetButton={false}
                variant="inline"
              />
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={onReset}
              >
                Réinitialiser
              </Button>
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => setSheetOpen(false)}
              >
                Terminé
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
