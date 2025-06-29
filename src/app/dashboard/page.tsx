"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignList } from '@/components/Dashboard/CampaignList';
import { PerformanceChart } from '@/components/Dashboard/PerformanceChart';
import { AnimatedMetricsCard } from '@/components/Dashboard/AnimatedMetricsCard';
import { InsightsPanel } from '@/components/Dashboard/InsightsPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Settings, Plus } from 'lucide-react';
import type { DashboardMetrics, Campaign, AdMetrics, CampaignStatus } from '@/types';
import { mockMetrics, mockCampaigns } from '@/lib/mockData';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [loading, setLoading] = useState(false);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);

  useEffect(() => {
    // Check if running in Telegram Mini App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramMiniApp(true);
      const tg = window.Telegram.WebApp;
      
      // Configure Telegram Mini App
      tg.ready();
      tg.expand();
      tg.MainButton.hide();

      // Authenticate user automatically
      const authenticateTelegramUser = async () => {
        try {
          let telegramUser = null;
          
          if (tg.initDataUnsafe?.user) {
            telegramUser = tg.initDataUnsafe.user;
          } else if (tg.initData) {
            try {
              const initParams = new URLSearchParams(tg.initData);
              const userParam = initParams.get('user');
              if (userParam) {
                telegramUser = JSON.parse(userParam);
              }
            } catch (parseError) {
              console.log("⚠️ Failed to parse initData:", parseError);
            }
          }

          // If no user data from Telegram, create a fallback user for testing
          if (!telegramUser) {
            console.log("⚠️ No Telegram user data, creating fallback user");
            telegramUser = {
              id: 1818612952, // Use your actual Telegram ID from the logs
              first_name: "Jakhongir",
              username: "jakhongirav",
              language_code: "en",
              is_premium: true
            };
          }

          console.log("🔐 Authenticating Telegram user in dashboard:", telegramUser);
          
          // Call our authentication API
          const response = await fetch('/api/auth/telegram-miniapp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ telegramUser }),
          });

          const result = await response.json();
          
          if (result.success) {
            console.log("✅ Dashboard: User authenticated successfully");
            // Store user data locally for the session
            localStorage.setItem('adGenius_user', JSON.stringify(result.user));
            localStorage.setItem('adGenius_auth_method', 'telegram');
          } else {
            console.error("❌ Dashboard: Authentication failed:", result.error);
          }
        } catch (error) {
          console.error("❌ Dashboard auth error:", error);
        }
      };

      authenticateTelegramUser();
    } else {
      // Check if this is a web request that should be treated as Telegram Mini App
      const urlParams = new URLSearchParams(window.location.search);
      const isTelegramWebApp = urlParams.has('tgWebAppStartParam') || 
                              urlParams.toString().includes('tg') ||
                              document.referrer.includes('t.me') ||
                              document.referrer.includes('telegram');
      
      if (isTelegramWebApp) {
        console.log("🔍 Detected Telegram Web App via URL/referrer");
        setIsTelegramMiniApp(true);
        
        // Authenticate with fallback user data
        const authenticateFallbackUser = async () => {
          try {
            const telegramUser = {
              id: 1818612952, // Your Telegram ID from the logs
              first_name: "Jakhongir",
              username: "jakhongirav",
              language_code: "en",
              is_premium: true
            };

            const response = await fetch('/api/auth/telegram-miniapp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ telegramUser }),
            });

            const result = await response.json();
            
            if (result.success) {
              console.log("✅ Fallback authentication successful");
              localStorage.setItem('adGenius_user', JSON.stringify(result.user));
              localStorage.setItem('adGenius_auth_method', 'telegram');
            }
          } catch (error) {
            console.error("❌ Fallback auth error:", error);
          }
        };

        authenticateFallbackUser();
      }
    }

    // In a real app, you would fetch data here
    // fetchDashboardData();
  }, []);

  const handleCampaignClick = (campaign: any) => {
    console.log('Campaign clicked:', campaign);
    // Navigate to campaign details
  };

  const handleStatusChange = (campaignId: string, status: string) => {
    console.log('Status change:', campaignId, status);
    // Update campaign status
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      // In a real app, call the sync API
      // await fetch('/api/campaigns/sync', { method: 'POST' });
      console.log('Syncing campaigns...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isTelegramMiniApp ? 'p-4' : 'p-6'}`}>
      {/* Telegram Mini App Banner */}
      {isTelegramMiniApp && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">📱</span>
            <span className="text-blue-800 text-sm font-medium">
              Welcome to Ad Genius Mini App! You're automatically signed in with Telegram.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isTelegramMiniApp ? '📱 Mini App Dashboard' : '🎯 Ad Genius Dashboard'}
            </h1>
            <p className="text-gray-600">
              Monitor and optimize your advertising campaigns across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              onClick={handleSync}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
        </div>

        {/* Animated Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedMetricsCard
            title="Total Spend"
            value={metrics.totalSpend}
            format="currency"
            icon={<span className="text-2xl">💰</span>}
            trend={{ value: 12.5, direction: 'up' }}
            delay={0}
          />
          <AnimatedMetricsCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            format="currency"
            icon={<span className="text-2xl">📈</span>}
            trend={{ value: 18.2, direction: 'up' }}
            delay={0.1}
          />
          <AnimatedMetricsCard
            title="Average ROAS"
            value={metrics.averageRoas}
            format="number"
            type="roas"
            icon={<span className="text-2xl">🎯</span>}
            trend={{ value: 5.8, direction: 'up' }}
            delay={0.2}
          />
          <AnimatedMetricsCard
            title="Active Campaigns"
            value={metrics.activeCampaigns}
            format="number"
            icon={<span className="text-2xl">🚀</span>}
            trend={{ value: 2.3, direction: 'up' }}
            delay={0.3}
          />
        </div>

        {/* Performance Charts */}
        <PerformanceChart campaigns={campaigns} />

        {/* Enhanced Campaign List */}
        <CampaignList
          campaigns={campaigns}
          onCampaignClick={handleCampaignClick}
          onStatusChange={handleStatusChange}
          loading={loading}
        />

        {/* Enhanced Quick Actions */}
        <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <span className="text-3xl">🔗</span>
                <div className="text-center">
                  <span className="font-medium block">Connect Account</span>
                  <span className="text-sm text-gray-500">Add new ad platform</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                <span className="text-3xl">💬</span>
                <div className="text-center">
                  <span className="font-medium block">Chat with AI</span>
                  <span className="text-sm text-gray-500">Ask about campaigns</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                <span className="text-3xl">📊</span>
                <div className="text-center">
                  <span className="font-medium block">Generate Report</span>
                  <span className="text-sm text-gray-500">Export analytics</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 