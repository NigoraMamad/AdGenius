import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { adPlatformManager } from "@/services/adPlatforms";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { userId, accountId } = await request.json();

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get ad accounts to sync
    let accountsQuery = supabase
      .from("ad_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (accountId) {
      accountsQuery = accountsQuery.eq("id", accountId);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;

    if (accountsError) {
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No active ad accounts found" },
        { status: 404 }
      );
    }

    // Sync each account
    const syncResults = await Promise.allSettled(
      accounts.map(async (account) => {
        try {
          await adPlatformManager.syncAccountData(account);

          // Update last sync time
          await supabase
            .from("ad_accounts")
            .update({
              last_sync: new Date().toISOString(),
              status: "active",
            })
            .eq("id", account.id);

          return { accountId: account.id, success: true };
        } catch (error) {
          console.error(`Sync failed for account ${account.id}:`, error);

          // Update account status on error
          await supabase
            .from("ad_accounts")
            .update({
              status: "error",
              last_sync: new Date().toISOString(),
            })
            .eq("id", account.id);

          return {
            accountId: account.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const successful = syncResults.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    const failed = syncResults.length - successful;

    return NextResponse.json<
      ApiResponse<{ successful: number; failed: number; results: any[] }>
    >({
      success: true,
      data: {
        successful,
        failed,
        results: syncResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : { error: result.reason }
        ),
      },
      message: `Sync completed: ${successful} successful, ${failed} failed`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Get sync status for user's accounts
    const { data: accounts, error } = await supabase
      .from("ad_accounts")
      .select("id, account_name, platform, status, last_sync")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json<ApiResponse<typeof accounts>>({
      success: true,
      data: accounts || [],
    });
  } catch (error) {
    console.error("Get sync status error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get sync status",
      },
      { status: 500 }
    );
  }
}
