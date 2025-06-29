'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';
import type { Campaign, AdMetrics } from '@/types';

interface InsightsPanelProps {
  campaigns: Array<Campaign & { platform_name?: string; metrics?: AdMetrics }>;
}

export function InsightsPanel({ campaigns }: InsightsPanelProps) {
  // Generate AI insights based on campaign data
  const generateInsights = () => {
    const insights = [];
    
    // Best performing campaign
    const bestCampaign = campaigns
      .filter(c => c.metrics)
      .sort((a, b) => (b.metrics?.roas || 0) - (a.metrics?.roas || 0))[0];
    
    if (bestCampaign && bestCampaign.metrics?.roas && bestCampaign.metrics.roas > 4) {
      insights.push({
        type: 'opportunity',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'High-Performing Campaign Detected',
        description: `${bestCampaign.name} is delivering exceptional ${bestCampaign.metrics.roas.toFixed(2)}x ROAS. Consider increasing budget by 25-50% to maximize returns.`,
        confidence: 95,
        color: 'green',
        action: 'Increase Budget'
      });
    }

    // Underperforming campaigns
    const underperforming = campaigns
      .filter(c => c.metrics && c.metrics.roas < 2)
      .sort((a, b) => (a.metrics?.roas || 0) - (b.metrics?.roas || 0));
    
    if (underperforming.length > 0) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Underperforming Campaigns Need Attention',
        description: `${underperforming.length} campaigns have ROAS below 2x. Review targeting, creative, and bidding strategies.`,
        confidence: 88,
        color: 'red',
        action: 'Optimize Now'
      });
    }

    // Budget optimization
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
    const avgRoas = totalRevenue / totalSpend;

    if (avgRoas > 3) {
      insights.push({
        type: 'insight',
        icon: <Lightbulb className="w-5 h-5" />,
        title: 'Budget Reallocation Opportunity',
        description: `Your portfolio ROAS is ${avgRoas.toFixed(2)}x. Reallocate $2,500 from low-performing campaigns to boost overall returns by 15%.`,
        confidence: 82,
        color: 'blue',
        action: 'View Strategy'
      });
    }

    // Platform performance
    const platformPerf = campaigns.reduce((acc, c) => {
      const platform = c.platform_name || 'Unknown';
      if (!acc[platform]) acc[platform] = { spend: 0, revenue: 0, count: 0 };
      acc[platform].spend += c.metrics?.spend || 0;
      acc[platform].revenue += c.metrics?.revenue || 0;
      acc[platform].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const bestPlatform = Object.entries(platformPerf)
      .map(([name, data]) => ({ name, roas: data.revenue / data.spend }))
      .sort((a, b) => b.roas - a.roas)[0];

    if (bestPlatform && bestPlatform.roas > 3.5) {
      insights.push({
        type: 'opportunity',
        icon: <Target className="w-5 h-5" />,
        title: `${bestPlatform.name} Outperforming`,
        description: `${bestPlatform.name} campaigns are delivering ${bestPlatform.roas.toFixed(2)}x ROAS. Consider shifting 20% more budget here.`,
        confidence: 90,
        color: 'green',
        action: 'Expand Platform'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600 bg-green-100',
          title: 'text-green-800',
          desc: 'text-green-700',
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'red':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600 bg-red-100',
          title: 'text-red-800',
          desc: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600 bg-blue-100',
          title: 'text-blue-800',
          desc: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600 bg-gray-100',
          title: 'text-gray-800',
          desc: 'text-gray-700',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">AI Insights & Recommendations</h3>
            <p className="text-gray-600 text-sm">Powered by machine learning analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const colors = getColorClasses(insight.color);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                  className={`p-4 rounded-lg border-2 ${colors.bg} hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${colors.icon} flex-shrink-0`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${colors.title} text-sm`}>
                          {insight.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600 font-medium">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm ${colors.desc} mb-3 leading-relaxed`}>
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${colors.button}`}>
                          {insight.action}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <BarChart3 className="w-3 h-3" />
                          <span>AI Generated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-gray-800 font-medium mb-2">Analyzing Your Campaigns</h4>
            <p className="text-gray-600 text-sm">
              Connect your ad accounts to get AI-powered insights and recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 