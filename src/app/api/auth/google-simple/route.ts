import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { googleUser } = await request.json();

    if (!googleUser || !googleUser.id) {
      return NextResponse.json(
        { error: "Invalid Google user data" },
        { status: 400 }
      );
    }

    console.log("🔐 Processing Google user:", googleUser.email);

    // Create a simplified user object for testing
    const user = {
      id: `google_${googleUser.id}`,
      email: googleUser.email,
      name:
        googleUser.name || `${googleUser.given_name} ${googleUser.family_name}`,
      first_name: googleUser.given_name,
      last_name: googleUser.family_name,
      avatar_url: googleUser.picture,
      google_id: googleUser.id,
      auth_provider: "google",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("✅ User created:", user.email);

    return NextResponse.json({
      success: true,
      user: user,
      isNewUser: true,
      message: "Test authentication successful",
    });
  } catch (error: any) {
    console.error("❌ Simple Google auth error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "Simplified Google OAuth endpoint for testing. Use POST to authenticate.",
    requiredFields: ["googleUser"],
    note: "This doesn't require database - for testing only",
  });
}
