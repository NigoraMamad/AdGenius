-- AI Advertising Optimization Platform Database Schema
-- This schema supports Supabase/PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    telegram_id TEXT UNIQUE,
    google_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad accounts table
CREATE TABLE ad_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'linkedin', 'twitter')),
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error')) DEFAULT 'active',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, account_id)
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
    platform_campaign_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'deleted', 'completed', 'draft')) DEFAULT 'active',
    objective TEXT,
    budget DECIMAL(12,2) DEFAULT 0,
    budget_type TEXT CHECK (budget_type IN ('daily', 'lifetime')) DEFAULT 'daily',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ad_account_id, platform_campaign_id)
);

-- Ad metrics table
CREATE TABLE ad_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend DECIMAL(12,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    ctr DECIMAL(6,4) DEFAULT 0,
    cpc DECIMAL(8,2) DEFAULT 0,
    cpa DECIMAL(8,2) DEFAULT 0,
    roas DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- AI insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN (
        'budget_optimization',
        'audience_performance',
        'creative_performance',
        'bidding_strategy',
        'schedule_optimization',
        'keyword_performance',
        'general_recommendation'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    recommendations JSONB DEFAULT '[]',
    status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    telegram_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    daily_summary BOOLEAN DEFAULT true,
    alert_thresholds JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert rules table
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    condition_type TEXT NOT NULL CHECK (condition_type IN (
        'budget_exceeded',
        'low_roas',
        'high_cpa',
        'low_ctr',
        'spend_anomaly',
        'conversion_drop'
    )),
    threshold_value DECIMAL(12,2),
    threshold_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    platforms TEXT[] DEFAULT '{}',
    campaigns TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert logs table
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_value DECIMAL(12,2),
    threshold_value DECIMAL(12,2),
    message TEXT,
    sent_telegram BOOLEAN DEFAULT false,
    sent_email BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_ad_accounts_user_id ON ad_accounts(user_id);
CREATE INDEX idx_ad_accounts_platform ON ad_accounts(platform);
CREATE INDEX idx_campaigns_ad_account_id ON campaigns(ad_account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_ad_metrics_campaign_id ON ad_metrics(campaign_id);
CREATE INDEX idx_ad_metrics_date ON ad_metrics(date);
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX idx_alert_logs_alert_rule_id ON alert_logs(alert_rule_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for ad_accounts
CREATE POLICY "Users can view own ad accounts" ON ad_accounts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own ad accounts" ON ad_accounts FOR ALL USING (auth.uid()::text = user_id::text);

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM ad_accounts 
        WHERE ad_accounts.id = campaigns.ad_account_id 
        AND ad_accounts.user_id::text = auth.uid()::text
    )
);

-- RLS Policies for ad_metrics
CREATE POLICY "Users can view own metrics" ON ad_metrics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM campaigns 
        JOIN ad_accounts ON ad_accounts.id = campaigns.ad_account_id
        WHERE campaigns.id = ad_metrics.campaign_id 
        AND ad_accounts.user_id::text = auth.uid()::text
    )
);

-- RLS Policies for ai_insights
CREATE POLICY "Users can view own insights" ON ai_insights FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own insights" ON ai_insights FOR ALL USING (auth.uid()::text = user_id::text);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid()::text = user_id::text);

-- RLS Policies for alert_rules
CREATE POLICY "Users can manage own alert rules" ON alert_rules FOR ALL USING (auth.uid()::text = user_id::text);

-- RLS Policies for alert_logs
CREATE POLICY "Users can view own alert logs" ON alert_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM alert_rules 
        WHERE alert_rules.id = alert_logs.alert_rule_id 
        AND alert_rules.user_id::text = auth.uid()::text
    )
);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_accounts_updated_at BEFORE UPDATE ON ad_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 