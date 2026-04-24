import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserByEmail } from "@/lib/session-user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
