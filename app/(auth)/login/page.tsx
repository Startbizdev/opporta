"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("flo@opporta.fr");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const sync = await fetch("/api/auth/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!sync.ok) {
        throw new Error("Synchronisation du compte impossible");
      }

      const profile = await sync.json();
      localStorage.setItem("user", profile.email ?? email);
      localStorage.setItem("userId", profile.id);
      localStorage.setItem("username", profile.username ?? email.split("@")[0]);

      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex size-11 items-center justify-center rounded-notion bg-overlay text-foreground ring-1 ring-border">
          <LayoutGrid className="size-6" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          OPPORTA
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Fil d’opportunités business — connexion sécurisée par e-mail
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Adresse e-mail
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2 pt-1">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Connexion…" : "Continuer"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setEmail("aless@opporta.fr")}
            className="w-full"
          >
            Compte démo aless@opporta.fr
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-2xs text-text-tertiary">
        Environnement de test : flo@opporta.fr ou aless@opporta.fr
      </p>
    </Card>
  );
}
