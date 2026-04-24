"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Jeton manquant");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => router.push("/"), 3000);
        } else {
          setError("Jeton invalide ou expiré");
        }
      } catch {
        setError("Erreur lors de la vérification");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Vérification en cours">
        <Card className="flex flex-col items-center border-border py-12 text-center">
          <Skeleton className="mb-4 size-14 shrink-0 rounded-full" />
          <Skeleton className="mx-auto mb-2 h-4 w-48 max-w-full" />
          <Skeleton className="mx-auto h-3 w-36 max-w-full" />
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <Card className="border-border py-12 text-center">
        <CheckCircle2
          className="mx-auto mb-4 size-12 text-success"
          strokeWidth={1.5}
        />
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          E-mail vérifié
        </h1>
        <p className="text-sm text-text-secondary">
          Redirection vers le fil…
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border py-12 text-center">
      <XCircle
        className="mx-auto mb-4 size-12 text-danger"
        strokeWidth={1.5}
      />
      <h1 className="mb-2 text-xl font-semibold text-foreground">Erreur</h1>
      <p className="mb-6 text-sm text-text-secondary">{error}</p>
      <Button
        variant="primary"
        onClick={() => router.push("/login")}
        className="w-full"
      >
        Retour à la connexion
      </Button>
    </Card>
  );
}
