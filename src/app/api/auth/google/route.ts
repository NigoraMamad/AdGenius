import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { googleUser, linkTelegramId } = await request.json();

    if (!googleUser || !googleUser.id) {
      return NextResponse.json(
        { error: "Invalid Google user data" },
        { status: 400 }
      );
    }

    console.log("🔐 Authenticating Google user:", googleUser.email);

    // Authenticate with Google
    const authResult = await authService.authenticateGoogleUser(googleUser);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Authentication failed" },
        { status: 500 }
      );
    }

    // If linkTelegramId is provided, try to link accounts
    if (linkTelegramId) {
      console.log("🔗 Attempting to link accounts...");
      const linkSuccess = await authService.linkAccounts(
        linkTelegramId,
        googleUser.id
      );

      if (linkSuccess) {
        console.log("✅ Accounts linked successfully");
      } else {
        console.log("⚠️  Account linking failed, but Google auth succeeded");
      }
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      isNewUser: authResult.isNewUser,
      message: authResult.isNewUser
        ? "Account created successfully"
        : "Signed in successfully",
    });
  } catch (error) {
    console.error("❌ Google auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Google OAuth endpoint. Use POST to authenticate.",
    requiredFields: ["googleUser"],
    optionalFields: ["linkTelegramId"],
  });
}
