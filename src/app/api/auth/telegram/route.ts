import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { validateTelegramWebAppData } from "@/lib/utils";
import type { TelegramWebAppInitData, User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    // Validate Telegram Web App data
    if (!validateTelegramWebAppData(initData)) {
      return NextResponse.json(
        { error: "Invalid Telegram data" },
        { status: 401 }
      );
    }

    // Parse init data
    const params = new URLSearchParams(initData);
    const userParam = params.get("user");

    if (!userParam) {
      return NextResponse.json(
        { error: "No user data provided" },
        { status: 400 }
      );
    }

    const telegramUser = JSON.parse(userParam);
    const supabase = createSupabaseAdmin();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id.toString())
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    let user: User;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          name: `${telegramUser.first_name} ${
            telegramUser.last_name || ""
          }`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          telegram_id: telegramUser.id.toString(),
          name: `${telegramUser.first_name} ${
            telegramUser.last_name || ""
          }`.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // Create session token (you might want to use JWT here)
    const sessionToken = Buffer.from(
      JSON.stringify({ userId: user.id, telegramId: telegramUser.id })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      user,
      sessionToken,
    });
  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
