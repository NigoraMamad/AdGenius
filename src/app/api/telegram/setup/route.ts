import { NextRequest, NextResponse } from "next/server";
import { telegramBot } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    // Set bot commands
    const commandsSet = await telegramBot.setBotCommands();

    if (commandsSet) {
      return NextResponse.json({
        success: true,
        message: "Bot commands set successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to set bot commands" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error setting up bot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to set up bot commands",
    commands: [
      {
        command: "start",
        description: "Show welcome message & dashboard button",
      },
      { command: "ai", description: "Ask AI for ad-optimization tips" },
      { command: "help", description: "Display usage instructions" },
    ],
  });
}
