import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveSessionUserId } from "@/lib/session-user";
import { z } from "zod";

const ReplySchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const userId = await resolveSessionUserId(req.headers.get("x-user-id"));
    const postId = id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const validated = ReplySchema.parse(body);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      );
    }

    const userCredits = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!userCredits || userCredits.amount < 1) {
      return NextResponse.json(
        { error: "Crédits insuffisants" },
        { status: 402 }
      );
    }

    await prisma.creditBalance.update({
      where: { userId },
      data: { amount: { decrement: 1 } },
    });

    const interaction = await prisma.interaction.create({
      data: {
        type: "reply",
        postId,
        userId,
      },
    });

    let conversation = await prisma.conversation.findFirst({
      where: {
        postId,
        OR: [
          { userAId: userId, userBId: post.userId },
          { userAId: post.userId, userBId: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          postId,
          userAId: userId,
          userBId: post.userId,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        content: validated.message,
        senderId: userId,
        conversationId: conversation.id,
        postId,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        score: { increment: 1 },
      },
    });

    return NextResponse.json(
      { interaction, message, conversation },
      { status: 201 }
    );
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const replies = await prisma.interaction.findMany({
      where: { postId: id, type: "reply" },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(replies);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
