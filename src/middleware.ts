import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get all possible headers and URL info
  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";
  const xRequestedWith = request.headers.get("x-requested-with") || "";
  const origin = request.headers.get("origin") || "";
  const host = request.headers.get("host") || "";
  const searchParams = request.nextUrl.searchParams.toString();

  // Very aggressive Telegram Mini App detection
  const isTelegramMiniApp =
    // User agent checks
    userAgent.toLowerCase().includes("telegram") ||
    userAgent.toLowerCase().includes("tg") ||
    // Referer checks
    referer.includes("telegram") ||
    referer.includes("t.me") ||
    referer.includes("tg") ||
    // Origin checks
    origin.includes("telegram") ||
    origin.includes("t.me") ||
    // Header checks
    xRequestedWith.includes("telegram") ||
    request.headers.get("x-telegram-web-app-init-data") ||
    // URL parameter checks
    searchParams.includes("tg") ||
    searchParams.includes("telegram") ||
    request.nextUrl.searchParams.has("tgWebAppStartParam") ||
    // Host/domain checks (our ngrok URL accessed from Telegram)
    (host.includes("ngrok") && pathname === "/dashboard") ||
    // Fallback: if accessing dashboard directly without clear web browser indicators
    (pathname === "/dashboard" &&
      !userAgent.includes("Chrome") &&
      !userAgent.includes("Firefox") &&
      !userAgent.includes("Safari"));

  console.log("🔍 Middleware check:", {
    pathname,
    userAgent: userAgent.substring(0, 100),
    referer,
    origin,
    isTelegramMiniApp,
    searchParams,
    host,
  });

  // AGGRESSIVE: For any dashboard access that could be Telegram, allow it
  if (pathname === "/dashboard") {
    // If any indication this might be from Telegram, allow access
    if (isTelegramMiniApp) {
      console.log("✅ Allowing Telegram Mini App access to dashboard");
      return NextResponse.next();
    }

    // Also allow if accessing via our ngrok URL (likely from Telegram bot)
    if (host.includes("ngrok")) {
      console.log("✅ Allowing ngrok access to dashboard (likely Telegram)");
      return NextResponse.next();
    }
  }

  // For web requests, check for authentication
  const authHeader = request.headers.get("authorization");
  const authCookie = request.cookies.get("adGenius_auth");

  // Simple check - in production you'd validate JWT tokens
  const isAuthenticated = !!(authHeader || authCookie);

  // Redirect unauthenticated users to signin
  if (protectedRoutes.includes(pathname) && !isAuthenticated) {
    console.log("❌ Redirecting unauthenticated user to signin");
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
