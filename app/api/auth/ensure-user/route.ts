import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureUserByEmail } from "@/lib/session-user";

function prismaErrorPayload(error: unknown): { status: number; body: object } {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      body: {
        error:
          "Base de données injoignable. Vérifie DATABASE_URL sur Vercel (URL « pooled » Neon, sslmode=require). Essaie sans channel_binding dans l’URL.",
        code: error.errorCode,
      },
    };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      status: 503,
      body: {
        error: `Erreur base de données (${error.code}). Migrations appliquées sur cette DB ?`,
        code: error.code,
      },
    };
  }
  return {
    status: 500,
    body: { error: "Erreur serveur" },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
    }

    const allowed = process.env.DEMO_LOGIN_EMAILS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (
      allowed &&
      allowed.length > 0 &&
      !allowed.includes(email.toLowerCase())
    ) {
      return NextResponse.json({ error: "E-mail non autorisé" }, { status: 403 });
    }

    const id = await ensureUserByEmail(email);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("ensure-user:", error);
    const { status, body } = prismaErrorPayload(error);
    return NextResponse.json(body, { status });
  }
}
