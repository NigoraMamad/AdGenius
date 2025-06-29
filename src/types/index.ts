// Core types for the AI Advertising Optimization Platform

export interface User {
  id: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  telegram_id?: string;
  google_id?: string;
  language_code?: string;
  is_premium?: boolean;
  auth_provider?: "telegram" | "google";
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdAccount {
  id: string;
  user_id: string;
  platform: AdPlatform;
  account_id: string;
  account_name: string;
  access_token: string;
  refresh_token?: string;
  status: "active" | "inactive" | "error";
  last_sync: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  ad_account_id: string;
  platform_campaign_id: string;
  name: string;
  status: CampaignStatus;
  objective: string;
  budget: number;
  budget_type: "daily" | "lifetime";
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AdMetrics {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  created_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  campaign_id?: string;
  type: InsightType;
  title: string;
  description: string;
  confidence_score: number;
  recommendations: Recommendation[];
  status: "pending" | "applied" | "dismissed";
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  action: RecommendationAction;
  description: string;
  expected_impact: string;
  urgency: "low" | "medium" | "high";
  data?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  context?: Record<string, any>;
  created_at: string;
}

// Enums
export type AdPlatform = "meta" | "google" | "tiktok" | "linkedin" | "twitter";

export type CampaignStatus =
  | "active"
  | "paused"
  | "deleted"
  | "completed"
  | "draft";

export type InsightType =
  | "budget_optimization"
  | "audience_performance"
  | "creative_performance"
  | "bidding_strategy"
  | "schedule_optimization"
  | "keyword_performance"
  | "general_recommendation";

export type RecommendationAction =
  | "increase_budget"
  | "decrease_budget"
  | "pause_campaign"
  | "change_bidding"
  | "update_targeting"
  | "refresh_creative"
  | "adjust_schedule"
  | "add_keywords"
  | "remove_keywords";

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Dashboard types
export interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  averageRoas: number;
  activeCampaigns: number;
  topPerformingCampaign?: Campaign;
  worstPerformingCampaign?: Campaign;
  recentInsights: AIInsight[];
}

// Telegram Mini App types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: any;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}
