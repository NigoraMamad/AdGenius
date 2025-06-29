"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Placeholder components - will work once dependencies are installed
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'default'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  variant?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-4 py-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 hover:bg-gray-50"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant as keyof typeof variants] || variants.default} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export default function Home() {
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if running in Telegram Mini App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramMiniApp(true);
      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram Mini App
      tg.ready();
      tg.expand();
      
      // Configure main button
      tg.MainButton.text = "Get Started";
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        // Handle getting started
        window.location.href = '/dashboard';
      });
    }
    
    setIsLoading(false);
  }, []);

  const features = [
    {
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations powered by Deepseek AI to optimize your campaign performance.",
      icon: "🤖"
    },
    {
      title: "Multi-Platform Support",
      description: "Connect Meta Ads, Google Ads, TikTok, LinkedIn, and more platforms in one dashboard.",
      icon: "🔗"
    },
    {
      title: "Real-time Alerts",
      description: "Receive instant notifications via Telegram when your campaigns need attention.",
      icon: "⚡"
    },
    {
      title: "Performance Analytics",
      description: "Track ROAS, CPA, CTR, and other key metrics with beautiful visualizations.",
      icon: "📊"
    },
    {
      title: "Budget Optimization",
      description: "Automatically identify budget reallocation opportunities across campaigns.",
      icon: "💰"
    },
    {
      title: "Chat with AI",
      description: "Ask questions about your campaigns and get instant AI-powered answers.",
      icon: "💬"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Optimize Your Ads with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                AI Power
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your advertising campaigns with AI-driven insights, real-time optimization, 
              and cross-platform management. Increase your ROAS while saving time.
            </p>
            
            {!isTelegramMiniApp && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button className="text-lg px-8 py-3">
                    Get Started Free
                  </Button>
                </Link>
                <Button variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-700">
                  Watch Demo
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to optimize your advertising campaigns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Supported Platforms
            </h2>
            <p className="text-xl text-gray-600">
              Connect all your advertising accounts in one place
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'Twitter Ads'].map((platform) => (
              <div key={platform} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-2xl">
                  📱
                </div>
                <p className="text-sm font-medium text-gray-700">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isTelegramMiniApp && (
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Optimize Your Campaigns?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of marketers who are already using AI to improve their advertising ROI.
            </p>
            <Link href="/dashboard">
              <Button className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Telegram Mini App specific content */}
      {isTelegramMiniApp && (
        <section className="bg-blue-600 text-white py-8">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl font-bold mb-4">
              Welcome to Ad Genius Mini App!
            </h2>
            <p className="text-blue-100 mb-4">
              Access your advertising insights directly from Telegram. 
              Connect your accounts and start optimizing your campaigns.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
