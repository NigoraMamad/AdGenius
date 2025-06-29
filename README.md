# Ad Genius - AI Advertising Optimization Platform

An AI-powered advertising optimization platform that supports both web and Telegram Mini App interfaces. Optimize your social media advertising campaigns with intelligent insights, real-time analytics, and cross-platform management.

## 🚀 Features

### Core Features

- **AI-Powered Insights**: Get intelligent recommendations powered by Deepseek AI
- **Multi-Platform Support**: Connect Meta Ads, Google Ads, TikTok, LinkedIn, and more
- **Real-time Analytics**: Track ROAS, CPA, CTR, and other key performance indicators
- **Telegram Bot Integration**: Receive notifications and chat with AI directly in Telegram
- **Telegram Mini App**: Access your dashboard and manage campaigns from Telegram
- **Budget Optimization**: Automated budget allocation recommendations
- **Performance Alerts**: Real-time notifications for campaign performance changes

### Technical Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **Tailwind CSS** for modern UI
- **Row Level Security** for secure data access
- **Real-time Synchronization** with advertising platforms

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── campaigns/     # Campaign management
│   │   └── telegram/      # Telegram bot webhook
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── Dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   ├── deepseek.ts      # AI integration
│   ├── telegram.ts      # Telegram bot client
│   └── utils.ts         # Utility functions
├── services/             # External service integrations
│   └── adPlatforms.ts   # Advertising platform APIs
└── types/               # TypeScript type definitions
    └── index.ts         # Core types
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Telegram Bot Token
- Deepseek API Key
- Advertising platform API credentials (Meta, Google, etc.)

### 1. Clone and Install

```bash
git clone <your-repo>
cd ad-genius
npm install --legacy-peer-deps
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Deepseek API
DEEPSEEK_API_KEY=your_deepseek_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=your_telegram_webhook_secret

# Advertising Platform APIs
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
# ... other platform credentials
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor
3. Generate types: `npm run db:generate` (update YOUR_PROJECT_ID in package.json first)

### 4. Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get your bot token and add it to `.env.local`
3. Set up the webhook URL: `https://yourdomain.com/api/telegram/webhook`
4. For Telegram Mini App, create a web app via BotFather and configure the URL

### 5. Advertising Platform Setup

#### Meta Ads

1. Create a Facebook App in the Meta Developers console
2. Add the Marketing API product
3. Get your App ID and App Secret
4. Configure redirect URI: `https://yourdomain.com/api/auth/callback/meta`

#### Google Ads

1. Create a project in Google Cloud Console
2. Enable Google Ads API
3. Create OAuth 2.0 credentials
4. Get your client ID, client secret, and developer token

### 6. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Configuration

### Telegram Mini App Configuration

Add these to your Telegram Mini App settings:

- **URL**: `https://yourdomain.com`
- **Domain**: Your production domain
- **Viewport**: Enabled for proper mobile display

### Supabase Configuration

Ensure Row Level Security is enabled and policies are properly configured. The schema includes all necessary RLS policies for secure multi-tenant access.

### AI Configuration

The platform uses Deepseek AI for generating insights. Configure your API key and adjust prompts in `src/lib/deepseek.ts` as needed.

## 📊 Usage

### Web Dashboard

1. Visit the web application
2. Connect your advertising accounts
3. View AI-generated insights and analytics
4. Configure alerts and automations

### Telegram Bot

Available commands:

- `/start` - Welcome message
- `/help` - Show available commands
- `/summary` - Get daily campaign summary
- `/insights` - View latest AI insights
- Send any question to chat with AI about your campaigns

### Telegram Mini App

- Access full dashboard functionality
- Manage account connections
- View detailed analytics
- Configure settings

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Secure API key management
- Telegram webhook verification
- OAuth 2.0 for advertising platform authentication
- JWT-based session management

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Manual Deployment

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your reverse proxy (nginx, etc.)

## 📈 API Integrations

### Supported Platforms

- **Meta Ads** (Facebook/Instagram)
- **Google Ads**
- **TikTok Ads** (coming soon)
- **LinkedIn Ads** (coming soon)
- **Twitter Ads** (coming soon)

### Data Synchronization

- Automatic daily sync
- Manual sync available via API
- Real-time webhook support where available

## 🤖 AI Features

### Insight Types

- Budget optimization recommendations
- Audience performance analysis
- Creative performance insights
- Bidding strategy suggestions
- Schedule optimization
- Keyword performance (for search platforms)

### Chat Interface

- Natural language queries
- Context-aware responses
- Campaign-specific insights
- Performance explanations

## 📱 Telegram Mini App Features

- **Native Telegram Integration**: Seamless experience within Telegram
- **Touch-Optimized UI**: Designed for mobile interaction
- **Push Notifications**: Real-time alerts via Telegram
- **Offline Support**: Core features work without internet
- **Theme Adaptation**: Follows Telegram's theme settings

## 🛠️ Development

### Adding New Advertising Platforms

1. Extend the `AdPlatformIntegration` abstract class in `src/services/adPlatforms.ts`
2. Implement authentication, data fetching, and metric calculation methods
3. Add platform types to the type definitions
4. Update the database schema if needed

### Customizing AI Prompts

Modify prompts in `src/lib/deepseek.ts` to customize AI behavior:

- Campaign analysis prompts
- Dashboard summary generation
- Chat response behavior

### Adding New Metrics

1. Update the `AdMetrics` interface in `src/types/index.ts`
2. Modify the database schema
3. Update calculation functions in `src/lib/utils.ts`
4. Add visualization components

## 🐛 Troubleshooting

### Common Issues

**Dependencies conflicts**: Use `npm install --legacy-peer-deps`

**Supabase connection**: Verify your environment variables and database URL

**Telegram webhook**: Ensure webhook URL is accessible and uses HTTPS

**Platform API errors**: Check your API credentials and rate limits

### Debugging

Enable debug mode:

```env
NODE_ENV=development
```

Check logs in:

- Browser console for client-side issues
- Server logs for API issues
- Supabase logs for database issues

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in this repository
- Contact via Telegram: @ad_genius_bot

---

**Built with ❤️ for the advertising optimization community**
