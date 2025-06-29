import type { AdAccount, Campaign, AdMetrics, AdPlatform } from "@/types";

interface PlatformConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface AdPlatformResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

abstract class AdPlatformIntegration {
  protected platform: AdPlatform;
  protected config: PlatformConfig;

  constructor(platform: AdPlatform, config: PlatformConfig) {
    this.platform = platform;
    this.config = config;
  }

  abstract authenticate(
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string }>;
  abstract getAccounts(accessToken: string): Promise<AdAccount[]>;
  abstract getCampaigns(
    accountId: string,
    accessToken: string
  ): Promise<Campaign[]>;
  abstract getMetrics(
    campaignId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<AdMetrics[]>;
  abstract refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }>;
}

class MetaAdsIntegration extends AdPlatformIntegration {
  constructor() {
    super("meta", {
      clientId: process.env.META_APP_ID!,
      clientSecret: process.env.META_APP_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/meta`,
    });
  }

  async authenticate(
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await fetch(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return { accessToken: data.access_token };
  }

  async getAccounts(accessToken: string): Promise<AdAccount[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.data.map((account: any) => ({
      id: account.id,
      platform: "meta" as AdPlatform,
      account_id: account.id,
      account_name: account.name,
      access_token: accessToken,
      status: account.account_status === 1 ? "active" : "inactive",
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  async getCampaigns(
    accountId: string,
    accessToken: string
  ): Promise<Campaign[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${accessToken}`
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.data.map((campaign: any) => ({
      id: campaign.id,
      ad_account_id: accountId,
      platform_campaign_id: campaign.id,
      name: campaign.name,
      status: campaign.status.toLowerCase(),
      objective: campaign.objective,
      budget: campaign.daily_budget || campaign.lifetime_budget || 0,
      budget_type: campaign.daily_budget ? "daily" : "lifetime",
      start_date: campaign.start_time,
      end_date: campaign.stop_time,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  async getMetrics(
    campaignId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<AdMetrics[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${campaignId}/insights?fields=impressions,clicks,spend,conversions,conversion_values&time_range={'since':'${dateRange.start}','until':'${dateRange.end}'}&access_token=${accessToken}`
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.data.map((metric: any) => ({
      id: `${campaignId}-${metric.date_start}`,
      campaign_id: campaignId,
      date: metric.date_start,
      impressions: parseInt(metric.impressions) || 0,
      clicks: parseInt(metric.clicks) || 0,
      spend: parseFloat(metric.spend) || 0,
      conversions: parseInt(metric.conversions) || 0,
      revenue: parseFloat(metric.conversion_values) || 0,
      ctr: parseInt(metric.clicks) / parseInt(metric.impressions) || 0,
      cpc: parseFloat(metric.spend) / parseInt(metric.clicks) || 0,
      cpa: parseFloat(metric.spend) / parseInt(metric.conversions) || 0,
      roas:
        parseFloat(metric.conversion_values) / parseFloat(metric.spend) || 0,
      created_at: new Date().toISOString(),
    }));
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    // Meta tokens are long-lived, implement refresh logic as needed
    throw new Error("Meta token refresh not implemented");
  }
}

class GoogleAdsIntegration extends AdPlatformIntegration {
  constructor() {
    super("google", {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-ads`,
    });
  }

  async authenticate(
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: "authorization_code",
        code,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async getAccounts(accessToken: string): Promise<AdAccount[]> {
    // Implementation for Google Ads accounts
    // This requires Google Ads API integration
    return [];
  }

  async getCampaigns(
    accountId: string,
    accessToken: string
  ): Promise<Campaign[]> {
    // Implementation for Google Ads campaigns
    return [];
  }

  async getMetrics(
    campaignId: string,
    accessToken: string,
    dateRange: { start: string; end: string }
  ): Promise<AdMetrics[]> {
    // Implementation for Google Ads metrics
    return [];
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }
}

export class AdPlatformManager {
  private integrations: Map<AdPlatform, AdPlatformIntegration> = new Map();

  constructor() {
    this.integrations.set("meta", new MetaAdsIntegration());
    this.integrations.set("google", new GoogleAdsIntegration());
  }

  getIntegration(platform: AdPlatform): AdPlatformIntegration {
    const integration = this.integrations.get(platform);
    if (!integration) {
      throw new Error(`Platform ${platform} not supported`);
    }
    return integration;
  }

  async syncAccountData(adAccount: AdAccount): Promise<void> {
    const integration = this.getIntegration(adAccount.platform);

    try {
      // Get campaigns
      const campaigns = await integration.getCampaigns(
        adAccount.account_id,
        adAccount.access_token
      );

      // Get metrics for each campaign
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        end: new Date().toISOString().split("T")[0],
      };

      for (const campaign of campaigns) {
        const metrics = await integration.getMetrics(
          campaign.platform_campaign_id,
          adAccount.access_token,
          dateRange
        );

        // Save to database (implement based on your DB layer)
        // await saveCampaignMetrics(campaign, metrics);
      }
    } catch (error) {
      console.error(
        `Error syncing ${adAccount.platform} account ${adAccount.account_id}:`,
        error
      );
      throw error;
    }
  }
}

export const adPlatformManager = new AdPlatformManager();
