import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    const user = await verifyEmail(email, token || "");

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Email vérifié",
    });

    response.cookies.set("email-verified", "true", {
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
