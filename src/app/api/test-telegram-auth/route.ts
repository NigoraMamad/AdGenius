import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";

  const isTelegramDetected =
    userAgent.toLowerCase().includes("telegram") ||
    referer.includes("t.me") ||
    referer.includes("telegram") ||
    host.includes("ngrok");

  return NextResponse.json({
    status: "Authentication Test",
    timestamp: new Date().toISOString(),
    headers: {
      userAgent: userAgent.substring(0, 100),
      referer,
      host,
    },
    detection: {
      isTelegramDetected,
      shouldBypassAuth: isTelegramDetected,
    },
    message: isTelegramDetected
      ? "✅ Telegram detected - authentication should be bypassed"
      : "❌ No Telegram detected - normal auth required",
  });
}
