import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { decodeFeedCursor, type FeedCursor } from "@/lib/feed-cursor";

const MIN_LIMIT = 1;
const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 20;

function cursorWhere(cursor: FeedCursor): Prisma.PostWhereInput {
  const at = new Date(cursor.createdAt);
  return {
    OR: [
      { score: { lt: cursor.score } },
      {
        AND: [{ score: cursor.score }, { createdAt: { lt: at } }],
      },
      {
        AND: [
          { score: cursor.score },
          { createdAt: at },
          { id: { lt: cursor.id } },
        ],
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limitRaw = searchParams.get("limit");
    let limit = limitRaw ? parseInt(limitRaw, 10) : DEFAULT_LIMIT;
    if (!Number.isFinite(limit) || limit < MIN_LIMIT) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const cursorParam = searchParams.get("cursor");
    const decoded = cursorParam ? decodeFeedCursor(cursorParam) : null;
    if (cursorParam && !decoded) {
      return NextResponse.json({ error: "Curseur invalide" }, { status: 400 });
    }

    const where: Prisma.PostWhereInput = {
      status: "ACTIVE",
      ...(decoded ? cursorWhere(decoded) : {}),
    };

    const rows = await prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        category: true,
        budgetMin: true,
        budgetMax: true,
        location: true,
        createdAt: true,
        score: true,
      },
    });

    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const tail = slice.at(-1);

    const nextCursor: FeedCursor | null =
      hasMore && tail
        ? {
            id: tail.id,
            score: tail.score,
            createdAt: tail.createdAt.toISOString(),
          }
        : null;

    const posts = slice.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      category: p.category,
      budgetMin: p.budgetMin,
      budgetMax: p.budgetMax,
      location: p.location,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({
      posts,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("feed error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
