import { NextRequest, NextResponse } from "next/server";
import { generateMagicLink } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    await generateMagicLink(email);

    return NextResponse.json({
      success: true,
      message: "Vérifiez votre email",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
