'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Campaign, AdMetrics } from '@/types';

interface PerformanceChartProps {
  campaigns: Array<Campaign & { platform_name?: string; metrics?: AdMetrics }>;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export function PerformanceChart({ campaigns }: PerformanceChartProps) {
  // Prepare data for different charts
  const roasData = campaigns
    .filter(c => c.metrics)
    .map(campaign => ({
      name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
      roas: campaign.metrics?.roas || 0,
      spend: campaign.metrics?.spend || 0,
      revenue: campaign.metrics?.revenue || 0,
      platform: campaign.platform_name,
    }))
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 10);

  const platformData = campaigns.reduce((acc, campaign) => {
    const platform = campaign.platform_name || 'Unknown';
    if (!acc[platform]) {
      acc[platform] = {
        name: platform,
        spend: 0,
        revenue: 0,
        campaigns: 0,
      };
    }
    acc[platform].spend += campaign.metrics?.spend || 0;
    acc[platform].revenue += campaign.metrics?.revenue || 0;
    acc[platform].campaigns += 1;
    return acc;
  }, {} as Record<string, any>);

  const platformChartData = Object.values(platformData);

  const budgetVsPerformance = campaigns
    .filter(c => c.metrics)
    .map(campaign => ({
      name: campaign.name.length > 12 ? campaign.name.substring(0, 12) + '...' : campaign.name,
      budget: campaign.budget,
      spend: campaign.metrics?.spend || 0,
      roas: campaign.metrics?.roas || 0,
      revenue: campaign.metrics?.revenue || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      {/* ROAS Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            📈 Top Performing Campaigns by ROAS
          </h3>
          <p className="text-gray-600 text-sm">
            Return on Ad Spend for your best performing campaigns
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={roasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                name === 'roas' ? `${value}x` : `$${value?.toLocaleString()}`,
                name === 'roas' ? 'ROAS' : name === 'spend' ? 'Spend' : 'Revenue'
              ]}
            />
            <Legend />
            <Bar dataKey="roas" fill="#8884d8" name="ROAS" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Performance Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🎯 Platform Performance
            </h3>
            <p className="text-gray-600 text-sm">
              Revenue and spend breakdown by platform
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `$${value?.toLocaleString()}`,
                  name === 'spend' ? 'Total Spend' : 'Total Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="spend" fill="#ff7300" name="Spend" radius={[2, 2, 0, 0]} />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              📊 Campaign Distribution
            </h3>
            <p className="text-gray-600 text-sm">
              Number of campaigns by platform
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, campaigns }) => `${name}: ${campaigns}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="campaigns"
              >
                {platformChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget vs Performance Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            💰 Budget vs Performance Analysis
          </h3>
          <p className="text-gray-600 text-sm">
            Budget allocation vs actual spend and revenue generation
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={budgetVsPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                name === 'roas' ? `${value}x` : `$${value?.toLocaleString()}`,
                name === 'budget' ? 'Budget' : name === 'spend' ? 'Actual Spend' : name === 'revenue' ? 'Revenue' : 'ROAS'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="budget" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Budget"
            />
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="#ff7300" 
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Actual Spend"
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#82ca9d" 
              strokeWidth={3}
              dot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 