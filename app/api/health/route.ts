import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Diagnostic rapide (DB). Ne pas exposer de secrets. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e) {
    const err = e as { message?: string; code?: string; name?: string };
    console.error("health/db:", e);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        code: err.code,
        name: err.name,
        hint:
          "Vérifie DATABASE_URL sur Vercel (URL pooler Neon, sslmode=require ; retirer channel_binding si besoin).",
      },
      { status: 503 }
    );
  }
}
