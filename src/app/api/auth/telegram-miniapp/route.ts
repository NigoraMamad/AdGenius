import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import type { TelegramUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { telegramUser } = await request.json();

    console.log("🔐 Telegram Mini App auth request:", telegramUser);

    if (!telegramUser) {
      return NextResponse.json(
        { error: "No Telegram user data provided" },
        { status: 400 }
      );
    }

    // Authenticate with Telegram
    const authResult = await authService.authenticateTelegramUser(telegramUser);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Authentication failed" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Telegram Mini App user authenticated:",
      authResult.user.first_name
    );

    return NextResponse.json({
      success: true,
      user: authResult.user,
      isNewUser: authResult.isNewUser,
      message: authResult.isNewUser ? "Welcome to Ad Genius!" : "Welcome back!",
    });
  } catch (error) {
    console.error("❌ Telegram Mini App auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Telegram Mini App authentication endpoint",
    usage: "POST with telegramUser data to authenticate",
  });
}
