import { NextRequest, NextResponse } from "next/server";
import { telegramBot } from "@/lib/telegram";
import { deepseek } from "@/lib/deepseek";
import { createSupabaseAdmin } from "@/lib/supabase";
import { authService } from "@/lib/auth";
import type { TelegramUser } from "@/lib/auth";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

// Helper function to get dashboard URL
function getDashboardUrl(): string {
  // Try to get from environment variable first
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (baseUrl) {
    return `${baseUrl}/dashboard`;
  }

  // Fallback to current ngrok URL
  return "https://5642-2001-b07-a14-d659-6578-a457-28d9-fec9.ngrok-free.app/dashboard";
}

// Simple in-memory store for user AI mode state
// In production, you'd want to use Redis or database
const userAiModeState = new Map<string, boolean>();

// Helper functions for AI mode
function setUserAiMode(userId: string, isAiMode: boolean) {
  userAiModeState.set(userId, isAiMode);
}

function isUserInAiMode(userId: string): boolean {
  return userAiModeState.get(userId) || false;
}

function clearUserAiMode(userId: string) {
  userAiModeState.delete(userId);
}

export async function POST(request: NextRequest) {
  try {
    console.log("🤖 Webhook received!");

    const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
    console.log("Secret token present:", !!secretToken);

    // Get the request body for debugging
    const body = await request.text();
    console.log("Webhook body:", body);

    // Parse the JSON
    let update: TelegramUpdate;
    try {
      update = JSON.parse(body);
      console.log("Parsed update:", JSON.stringify(update, null, 2));
    } catch (parseError) {
      console.error("Failed to parse webhook body:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate webhook secret
    if (!telegramBot.validateWebhookData(secretToken || "")) {
      console.log("❌ Webhook validation failed!");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Webhook validation passed!");

    if (update.message && update.message.text) {
      console.log("📨 Processing message:", update.message.text);
      await handleMessage(update.message);
    } else {
      console.log("⚠️  No message text found in update");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;
  const firstName = message.from.first_name || "there";
  const userIdStr = userId.toString();

  console.log(`👤 Processing message from ${firstName} (${userId}): "${text}"`);

  try {
    // 🔐 AUTOMATIC TELEGRAM AUTHENTICATION
    // Every interaction automatically authenticates/creates user
    const telegramUser: TelegramUser = {
      id: userId,
      first_name: message.from.first_name,
      last_name: message.from.last_name,
      username: message.from.username,
      language_code: message.from.language_code,
      is_premium: message.from.is_premium || false,
    };

    console.log("🔐 Authenticating Telegram user...");
    const authResult = await authService.authenticateTelegramUser(telegramUser);

    if (!authResult.user) {
      console.error("❌ Authentication failed:", authResult.error);
      await telegramBot.sendMessage({
        chat_id: chatId,
        text: "❌ Sorry, I couldn't authenticate you. Please try again later.",
      });
      return;
    }

    if (authResult.isNewUser) {
      console.log(`✨ New user created: ${firstName}`);
    } else {
      console.log(`✅ Existing user authenticated: ${firstName}`);
    }

    const authenticatedUser = authResult.user;

    // Check if user is in AI mode first
    if (isUserInAiMode(userIdStr)) {
      console.log("🧠 User is in AI mode, processing as AI conversation");

      // Handle exit commands
      if (
        text.toLowerCase() === "/exit" ||
        text.toLowerCase() === "/stop" ||
        text.toLowerCase() === "/end"
      ) {
        clearUserAiMode(userIdStr);
        await telegramBot.sendMessage({
          chat_id: chatId,
          text: "✅ Exited AI conversation mode. You can now use regular commands or type /ai to start a new AI conversation.",
        });
        return;
      }

      // Handle AI conversation (user is already authenticated)
      await handleAIConversation(chatId, text, authenticatedUser.id);
      return;
    }

    // Handle regular commands when not in AI mode
    if (text.startsWith("/start")) {
      console.log("🚀 Handling /start command");
      await handleStartCommand(chatId, firstName, authResult.isNewUser);
      return;
    } else if (text.startsWith("/help")) {
      console.log("❓ Handling /help command");
      await handleHelpCommand(chatId);
      return;
    } else if (text.startsWith("/ai")) {
      console.log("🧠 Handling /ai command - entering AI mode");
      await handleEnterAiMode(chatId, userIdStr);
      return;
    }

    console.log("✅ User authenticated, but no specific command recognized");
    await telegramBot.sendMessage({
      chat_id: chatId,
      text: `Hi ${firstName}! I didn't recognize that command. Here's what you can do:

🚀 /start - Show welcome message
🧠 /ai - Start AI conversation mode
❓ /help - Show all commands

Or use the dashboard button to access the full interface!`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Dashboard",
              web_app: {
                url: getDashboardUrl(),
              },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error handling message:", error);
    await telegramBot.sendMessage({
      chat_id: chatId,
      text: "❌ Sorry, I encountered an error. Please try again later.",
    });
  }
}

async function handleStartCommand(
  chatId: number,
  firstName: string,
  isNewUser: boolean
) {
  console.log(
    `🚀 Sending start command response to ${firstName} (chat: ${chatId})`
  );

  const welcomeText = isNewUser
    ? `🎉 Welcome to Ad Genius, ${firstName}!

I'm your AI-powered advertising optimization assistant. I help you maximize your ROAS and optimize campaigns across multiple platforms.

✨ **You're now automatically signed in with your Telegram account!**

🎯 **What I can do:**
• Analyze campaign performance
• Provide optimization recommendations  
• Answer questions about your ads
• Send real-time alerts and insights

📱 **Get started by opening your dashboard below** 👇`
    : `🚀 Welcome back, ${firstName}!

Ready to optimize your advertising campaigns? I'm here to help you maximize your ROAS across all platforms.

🎯 **Quick Actions:**
• Start AI conversation with /ai
• Open your dashboard below
• Ask me anything about your campaigns

📱 **Access your full analytics** 👇`;

  try {
    const result = await telegramBot.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Dashboard",
              web_app: {
                url: getDashboardUrl(),
              },
            },
          ],
          [
            {
              text: "💬 Start AI Chat",
              callback_data: "start_ai_chat",
            },
            {
              text: "❓ Help",
              callback_data: "help",
            },
          ],
        ],
      },
    });
    console.log("✅ Start command message sent successfully:", result);
  } catch (error) {
    console.error("❌ Error sending start command message:", error);
  }
}

async function handleHelpCommand(chatId: number) {
  console.log(`❓ Sending help command response to chat: ${chatId}`);

  const helpText = `🤖 **Ad Genius Bot Commands:**

🚀 \`/start\` - Show welcome message & dashboard button
🧠 \`/ai\` - Start AI conversation mode
❓ \`/help\` - Display this help message

📝 **AI Mode:**
• Type \`/ai\` to enter AI conversation mode
• Then just chat normally with AI about advertising
• Use \`/exit\`, \`/stop\`, or \`/end\` to leave AI mode

💡 **You can also:**
• Use the dashboard for detailed analytics
• Get real-time alerts and recommendations

🔗 **Dashboard:** Use the button below to access your full dashboard`;

  try {
    const result = await telegramBot.sendMessage({
      chat_id: chatId,
      text: helpText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Dashboard",
              web_app: {
                url: getDashboardUrl(),
              },
            },
          ],
        ],
      },
    });
    console.log("✅ Help command message sent successfully:", result);
  } catch (error) {
    console.error("❌ Error sending help command message:", error);
  }
}

async function handleEnterAiMode(chatId: number, userId: string) {
  console.log(`🧠 Entering AI mode for user ${userId}`);

  // Set user in AI mode
  setUserAiMode(userId, true);

  await telegramBot.sendMessage({
    chat_id: chatId,
    text: `🧠 **AI Conversation Mode Activated!**

Now I'm ready to help you with advertising optimization. Just send me your questions naturally!

💡 **Examples:**
• "How can I improve my Facebook ads ROAS?"
• "What's the best bidding strategy for e-commerce?"
• "Analyze my recent campaign performance"

📋 **To exit AI mode:** Type /exit, /stop, or /end

🔥 **Let's optimize your ads! What would you like to know?**`,
    parse_mode: "Markdown",
  });
}

async function handleAIConversation(
  chatId: number,
  question: string,
  userId: string
) {
  console.log(
    `💬 Processing AI conversation for user ${userId}: "${question}"`
  );

  // Send typing indicator
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        action: "typing",
      }),
    }
  );

  const supabase = createSupabaseAdmin();

  try {
    // Get user's recent campaign data for context
    const { data: recentMetrics } = await supabase
      .from("ad_metrics")
      .select(
        `
        *,
        campaigns!inner(
          *,
          ad_accounts!inner(
            user_id,
            platform
          )
        )
      `
      )
      .eq("campaigns.ad_accounts.user_id", userId)
      .gte(
        "date",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
      .order("date", { ascending: false })
      .limit(50);

    const context = {
      recentMetrics: recentMetrics || [],
      question,
      timestamp: new Date().toISOString(),
      isAICommand: true,
      isConversationMode: true,
    };

    const aiResponse = await deepseek.answerQuestion(question, context);

    // Save chat message
    await supabase.from("chat_messages").insert([
      {
        user_id: userId,
        role: "user",
        content: question,
        created_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        role: "assistant",
        content: aiResponse,
        context,
        created_at: new Date().toISOString(),
      },
    ]);

    await telegramBot.sendMessage({
      chat_id: chatId,
      text: `${aiResponse}

💡 *Continue asking questions or type /exit to leave AI mode*`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📊 View Dashboard",
              web_app: {
                url: getDashboardUrl(),
              },
            },
            {
              text: "🚪 Exit AI Mode",
              callback_data: "exit_ai_mode",
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error in AI conversation:", error);
    await telegramBot.sendMessage({
      chat_id: chatId,
      text: "❌ Sorry, I encountered an error processing your question. Please try again or type /exit to leave AI mode.",
    });
  }
}
