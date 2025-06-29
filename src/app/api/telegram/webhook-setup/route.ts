import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl is required" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Set webhook
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `${webhookUrl}/api/telegram/webhook`,
          secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || "default_secret",
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook set successfully",
        webhookUrl: `${webhookUrl}/api/telegram/webhook`,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to set webhook",
          details: data.description,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error setting webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Get current webhook info
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    );
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting webhook info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
