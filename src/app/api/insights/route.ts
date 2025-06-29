import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { deepseek } from "@/lib/deepseek";
import type { ApiResponse, AIInsight } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") || "pending";

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: insights, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json<ApiResponse<AIInsight[]>>({
      success: true,
      data: insights || [],
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch insights",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, campaignData, type } = await request.json();

    if (!userId || !campaignData) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User ID and campaign data required" },
        { status: 400 }
      );
    }

    // Generate AI insights using Deepseek
    const aiResponse = await deepseek.generateCampaignInsights(campaignData);

    // Parse AI response and create insight
    const insight = {
      user_id: userId,
      campaign_id: campaignData.id,
      type: type || "general_recommendation",
      title: "AI-Generated Insight",
      description: aiResponse,
      confidence_score: 0.8, // This would be calculated based on data quality
      recommendations: [],
      status: "pending",
    };

    const supabase = createSupabaseAdmin();

    const { data: newInsight, error } = await supabase
      .from("ai_insights")
      .insert([insight])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json<ApiResponse<AIInsight>>({
      success: true,
      data: newInsight,
      message: "Insight generated successfully",
    });
  } catch (error) {
    console.error("Generate insight error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate insight",
      },
      { status: 500 }
    );
  }
}
