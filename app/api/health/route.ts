import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Diagnostic rapide (DB). Ne pas exposer de secrets. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e) {
    const err = e as {
      message?: string;
      code?: string;
      name?: string;
      errorCode?: string;
    };
    console.error("health/db:", e);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        prismaCode: err.errorCode ?? err.code,
        name: err.name,
        message: err.message?.slice(0, 280),
        hint:
          "Si P1001/P1017 : URL Neon pooler + sslmode=require. Client Prisma doit être @prisma/client (node_modules).",
      },
      { status: 503 }
    );
  }
}
