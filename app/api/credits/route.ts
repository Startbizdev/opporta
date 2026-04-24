import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveSessionUserId } from "@/lib/session-user";

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveSessionUserId(req.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const balance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      return NextResponse.json(
        { error: "Balance non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
