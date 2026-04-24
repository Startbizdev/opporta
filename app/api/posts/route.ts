import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePostCompleteness, calculateScore } from "@/lib/scoring";
import { Prisma } from "@prisma/client";
import { resolveSessionUserId } from "@/lib/session-user";
import { z } from "zod";

const PostSchema = z.object({
  type: z.enum(["REQUEST", "OFFER"]),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  category: z.string(),
  budgetMin: z.number().int().optional(),
  budgetMax: z.number().int().optional(),
  location: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");

    const where: Prisma.PostWhereInput = { status: "ACTIVE" };
    if (category) where.category = category;
    if (type) where.type = type;
    if (minBudget) where.budgetMin = { gte: parseInt(minBudget, 10) };
    if (maxBudget) where.budgetMax = { lte: parseInt(maxBudget, 10) };

    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, username: true } },
        interactions: true,
      },
    });

    const total = await prisma.post.count({ where });

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await resolveSessionUserId(req.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const validated = PostSchema.parse(body);

    const completeness = calculatePostCompleteness(validated);
    const score = calculateScore({
      budgetDefined: !!(validated.budgetMin && validated.budgetMax),
      completeness,
      engagement: 0,
      ageInHours: 0,
    });

    const post = await prisma.post.create({
      data: {
        ...validated,
        score,
        userId,
      },
      include: { user: { select: { username: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      );
    }
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
