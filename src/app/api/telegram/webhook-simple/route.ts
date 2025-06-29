import { NextRequest, NextResponse } from "next/server";
import { telegramBot } from "@/lib/telegram";
import { deepseek } from "@/lib/deepseek";
import {
  getCampaignSummary,
  getTopPerformingCampaigns,
  getWorstPerformingCampaigns,
} from "@/lib/mockData";

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
    console.log("🤖 Simple webhook received!");

    const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
    console.log("Secret token present:", !!secretToken);

    // Simple validation
    if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      console.log("❌ Webhook validation failed!");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();
    console.log("📨 Update received:", JSON.stringify(update, null, 2));

    if (update.message && update.message.text) {
      await handleSimpleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Simple webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleSimpleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;
  const firstName = message.from.first_name || "there";
  const userIdStr = userId.toString();

  console.log(`👤 Simple processing: ${firstName} said "${text}"`);

  try {
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

      // Handle AI conversation with mock data
      await handleAIConversationWithMockData(chatId, text, firstName);
      return;
    }

    // Handle regular commands when not in AI mode
    if (text.startsWith("/start")) {
      await telegramBot.sendMessage({
        chat_id: chatId,
        text: `🚀 Hello ${firstName}! Bot is working with AI insights!

🔧 **Commands:**
• /start - This welcome message
• /ai - Start AI conversation mode  
• /help - Show help
• /insights - Quick campaign summary

⚠️ *Using mock campaign data for demo*`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Open Dashboard",
                web_app: {
                  url: "https://5642-2001-b07-a14-d659-6578-a457-28d9-fec9.ngrok-free.app/dashboard",
                },
              },
            ],
            [
              {
                text: "🧠 Start AI Chat",
                callback_data: "start_ai_chat",
              },
              {
                text: "📊 Quick Insights",
                callback_data: "quick_insights",
              },
            ],
          ],
        },
      });
    } else if (text.startsWith("/help")) {
      await telegramBot.sendMessage({
        chat_id: chatId,
        text: `❓ **Ad Genius Bot Help**

🚀 /start - Welcome message
🧠 /ai - Start AI conversation mode
📊 /insights - Quick campaign summary  
❓ /help - This help message  

🤖 **AI Mode:**
• Type /ai to enter AI conversation mode
• Then just chat normally about advertising
• Use /exit, /stop, or /end to leave AI mode

💡 *Bot now has access to your campaign data!*`,
      });
    } else if (text.startsWith("/ai")) {
      console.log("🧠 Handling /ai command - entering AI mode");
      await handleEnterAiMode(chatId, userIdStr, firstName);
      return;
    } else if (text.startsWith("/insights")) {
      await handleQuickInsights(chatId, firstName);
      return;
    } else {
      await telegramBot.sendMessage({
        chat_id: chatId,
        text: `👋 Hi ${firstName}! I received: "${text}"

Try these commands:
• /start - Welcome
• /ai - Start AI conversation  
• /insights - Campaign summary
• /help - Help`,
      });
    }
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}

async function handleEnterAiMode(
  chatId: number,
  userId: string,
  firstName: string
) {
  console.log(`🧠 Entering AI mode for user ${userId}`);

  // Set user in AI mode
  setUserAiMode(userId, true);

  await telegramBot.sendMessage({
    chat_id: chatId,
    text: `🧠 **AI Conversation Mode Activated!**

Hi ${firstName}! Now I can help you optimize your advertising campaigns with real insights from your data.

📊 **I have access to:**
• 30 active campaigns across Google Ads & Meta
• $54,859.50 total spend, $193,652.68 revenue
• 3.44 average ROAS across all campaigns
• Individual campaign performance metrics

💡 **Try asking:**
• "How are my campaigns performing?"
• "Which campaigns should I optimize?"
• "What's my best performing campaign?"
• "How can I improve my ROAS?"

📋 **To exit AI mode:** Type /exit, /stop, or /end

🔥 **What would you like to know about your campaigns?**`,
    parse_mode: "Markdown",
  });
}

async function handleAIConversationWithMockData(
  chatId: number,
  question: string,
  firstName: string
) {
  console.log(`💬 Processing AI conversation: "${question}"`);

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

  try {
    // Get mock campaign data for context
    const campaignSummary = getCampaignSummary();
    const topCampaigns = getTopPerformingCampaigns();
    const worstCampaigns = getWorstPerformingCampaigns();

    const context = {
      campaignSummary,
      topCampaigns,
      worstCampaigns,
      question,
      userName: firstName,
      timestamp: new Date().toISOString(),
      isAICommand: true,
      isConversationMode: true,
      isMockData: true,
    };

    const aiResponse = await deepseek.answerQuestion(question, context);

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
                url: "https://5642-2001-b07-a14-d659-6578-a457-28d9-fec9.ngrok-free.app/dashboard",
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

async function handleQuickInsights(chatId: number, firstName: string) {
  try {
    const summary = getCampaignSummary();
    const topCampaigns = getTopPerformingCampaigns();
    const worstCampaigns = getWorstPerformingCampaigns();

    const bestCampaign = summary.bestCampaign;
    const worstCampaign = summary.worstCampaign;

    const insightsText = `📊 **Quick Campaign Insights for ${firstName}**

💰 **Overall Performance:**
• Total Spend: $${summary.totalSpend.toLocaleString()}
• Total Revenue: $${summary.totalRevenue.toLocaleString()}
• Average ROAS: ${summary.averageRoas}x
• Active Campaigns: ${summary.totalCampaigns}

📈 **Platform Breakdown:**
• Google Ads: ${summary.googleCampaigns} campaigns
• Meta Ads: ${summary.metaCampaigns} campaigns

🏆 **Best Performer:**
${bestCampaign?.name} - ${bestCampaign?.metrics?.roas}x ROAS

⚠️ **Needs Attention:**
${worstCampaign?.name} - ${worstCampaign?.metrics?.roas}x ROAS

💡 *Type /ai for detailed optimization advice!*`;

    await telegramBot.sendMessage({
      chat_id: chatId,
      text: insightsText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🧠 Start AI Chat",
              callback_data: "start_ai_chat",
            },
            {
              text: "📊 View Dashboard",
              web_app: {
                url: "https://5642-2001-b07-a14-d659-6578-a457-28d9-fec9.ngrok-free.app/dashboard",
              },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error in quick insights:", error);
    await telegramBot.sendMessage({
      chat_id: chatId,
      text: "❌ Sorry, I couldn't generate insights right now. Please try again later.",
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Simple Telegram webhook with AI - working!",
    timestamp: new Date().toISOString(),
  });
}
