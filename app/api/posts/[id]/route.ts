import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const post = await prisma.post.findFirst({
      where: { id, status: "ACTIVE" },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
