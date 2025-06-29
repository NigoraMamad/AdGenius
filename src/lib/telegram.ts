interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: any;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

interface BotCommand {
  command: string;
  description: string;
}

class TelegramBot {
  private get token(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("❌ TELEGRAM_BOT_TOKEN not found in environment!");
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }
    return token;
  }

  private get baseUrl(): string {
    return `https://api.telegram.org/bot${this.token}`;
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      console.log(
        `📤 Sending message to chat ${message.chat_id}:`,
        message.text.substring(0, 100) + "..."
      );

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const data: TelegramResponse = await response.json();

      if (data.ok) {
        console.log("✅ Message sent successfully");
      } else {
        console.error("❌ Failed to send message:", data.description);
      }

      return data.ok;
    } catch (error) {
      console.error("❌ Error sending Telegram message:", error);
      return false;
    }
  }

  async setBotCommands(): Promise<boolean> {
    const commands: BotCommand[] = [
      {
        command: "start",
        description: "Show welcome message & dashboard button",
      },
      {
        command: "ai",
        description: "Ask AI for ad-optimization tips",
      },
      {
        command: "help",
        description: "Display usage instructions",
      },
    ];

    try {
      const response = await fetch(`${this.baseUrl}/setMyCommands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commands }),
      });

      const data: TelegramResponse = await response.json();
      console.log("Bot commands set:", data);
      return data.ok;
    } catch (error) {
      console.error("Error setting bot commands:", error);
      return false;
    }
  }

  async sendCampaignAlert(
    chatId: number,
    campaign: any,
    alertType: string
  ): Promise<boolean> {
    const alertMessages = {
      budget_exceeded: `🚨 *Budget Alert*\n\nCampaign: ${campaign.name}\nBudget exceeded by ${campaign.overBudget}%\n\nAction needed!`,
      low_performance: `📉 *Performance Alert*\n\nCampaign: ${campaign.name}\nROAS dropped to ${campaign.roas}\n\nReview recommended!`,
      high_performance: `🚀 *Opportunity Alert*\n\nCampaign: ${campaign.name}\nExcellent ROAS: ${campaign.roas}\n\nConsider increasing budget!`,
      optimization_ready: `💡 *Optimization Available*\n\nNew insights available for: ${campaign.name}\n\nCheck your dashboard for recommendations!`,
    };

    const text =
      alertMessages[alertType as keyof typeof alertMessages] ||
      "Campaign update available";

    return this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });
  }

  async sendDailySummary(chatId: number, summary: any): Promise<boolean> {
    const text = `📊 *Daily Summary*

💰 Total Spend: $${summary.totalSpend}
📈 Total Revenue: $${summary.totalRevenue}
🎯 Average ROAS: ${summary.averageRoas}
🚀 Active Campaigns: ${summary.activeCampaigns}

${summary.topInsight ? `💡 Top Insight: ${summary.topInsight}` : ""}

Check your dashboard for detailed insights!`;

    return this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });
  }

  async setWebhook(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        }),
      });

      const data: TelegramResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error("Error setting webhook:", error);
      return false;
    }
  }

  validateWebhookData(secretToken: string): boolean {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    console.log("🔐 Validating webhook secret...");
    console.log("Expected secret present:", !!expectedSecret);
    console.log("Provided secret present:", !!secretToken);
    console.log("Secrets match:", secretToken === expectedSecret);

    return secretToken === expectedSecret;
  }
}

export const telegramBot = new TelegramBot();
