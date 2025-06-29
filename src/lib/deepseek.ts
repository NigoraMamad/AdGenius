interface DeepseekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepseekClient {
  private apiKey: string;
  private baseUrl: string;
  private useMockMode: boolean;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    this.useMockMode = !this.apiKey; // Use mock mode if no API key

    if (this.useMockMode) {
      console.log("🧠 Using mock AI mode - no Deepseek API key configured");
    }
  }

  async chat(messages: DeepseekMessage[]): Promise<string> {
    if (this.useMockMode) {
      return this.generateMockResponse(messages);
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error(
          `Deepseek API error: ${response.status} ${response.statusText}`
        );
        // Fallback to mock mode if API fails
        return this.generateMockResponse(messages);
      }

      const data: DeepseekResponse = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error calling Deepseek API:", error);
      // Fallback to mock mode if API fails
      return this.generateMockResponse(messages);
    }
  }

  private generateMockResponse(messages: DeepseekMessage[]): string {
    const userMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    console.log("🧠 Mock AI processing question:", userMessage);

    // Specific campaign name questions (PRIORITY 1 - Most specific)
    if (
      userMessage.includes("cyber monday") ||
      userMessage.includes("valentine") ||
      userMessage.includes("summer style")
    ) {
      console.log("🧠 Detected: Specific campaign question");
      if (userMessage.includes("cyber monday")) {
        return `🏆 **Cyber Monday Exclusive Campaign Analysis**

This is your absolute star performer! 🌟

📊 **Performance Metrics:**
• ROAS: **4.75x** (Excellent!)
• Spend: $1,923.78
• Revenue: $9,134.56
• Conversions: 342
• CPA: $5.63
• CTR: 2.88%
• Platform: Meta Ads

🎯 **Why It's Crushing It:**
• Perfect seasonal timing
• Strong promotional messaging
• High-converting audience
• Optimized creative assets

💡 **Scale-Up Strategy:**
• Increase daily budget by 30-50%
• Duplicate for other seasonal events
• Test similar creative style on Google Ads
• Create lookalike audiences from converters

This campaign is your money printer! 💰`;
      } else if (userMessage.includes("valentine")) {
        return `⚠️ **Valentine's Day Looks Campaign Analysis**

This campaign needs immediate attention! 

📊 **Performance Metrics:**
• ROAS: **2.19x** (Below target)
• Spend: $1,456.78
• Revenue: $3,189.45
• Conversions: 134
• CPA: $10.87
• CTR: 2.34%
• Platform: Meta Ads

🔍 **Issues Identified:**
• Seasonal relevance expired
• High cost per acquisition
• Creative fatigue likely
• Audience saturation

🚀 **Immediate Action Plan:**
• Reduce budget by 50% immediately
• Refresh with current seasonal themes
• Test new audience segments
• Consider pausing if no improvement in 3 days

Expected improvement: 35-45% ROAS boost! 📈`;
      } else {
        return `📈 **Summer Style Refresh Campaign Analysis**

A mid-tier performer with good potential!

📊 **Performance Metrics:**
• ROAS: **2.21x** (Needs improvement)
• Spend: $1,151.91
• Revenue: $2,542.46
• Conversions: 138
• CPA: $8.35
• CTR: 2.03%
• Platform: Google Ads

💡 **Optimization Opportunities:**
• Test new ad copy variations
• Expand to Shopping campaigns
• Add negative keywords
• Try broad match modifier keywords

Target ROAS: 3.5x within 2 weeks! 🎯`;
      }
    }

    // Campaign management and pause questions (PRIORITY 2)
    if (
      userMessage.includes("which campaigns") ||
      userMessage.includes("campaign list") ||
      userMessage.includes("pause") ||
      userMessage.includes("quali campagne") ||
      userMessage.includes("campaigns should") ||
      userMessage.includes("consider pausing") ||
      userMessage.includes("improving") ||
      userMessage.includes("below 2.0") ||
      userMessage.includes("above") ||
      userMessage.includes("highlight")
    ) {
      console.log("🧠 Detected: Campaign list/pause question");
      return `🚨 **Campaigns Requiring Action**

Based on your performance thresholds, here are campaigns that need attention:

⚠️ **IMMEDIATE ACTION REQUIRED:**

🔴 **Pause These Campaigns:**
• **Valentine's Day Looks** - 2.19x ROAS, $10.87 CPA
  → *Below your 2.5x ROAS threshold*
  → *Action: Pause or reduce budget by 75%*

🟡 **Optimize These Campaigns:**
• **Summer Style Refresh** - 2.21x ROAS, $8.35 CPA  
  → *Just above pause threshold*
  → *Action: Test new creatives and audiences*

• **Festive Fashion Finds** - 2.82x ROAS, $5.11 CPA
  → *Mediocre performance*
  → *Action: Refresh ad copy and optimize targeting*

🟢 **Scale These Winners:**
• **Cyber Monday Exclusive** - 4.75x ROAS, $5.63 CPA ✅
• **Tech Gadgets Galore** - 4.21x ROAS, $6.21 CPA ✅
• **Weekend Wardrobe Refresh** - 4.19x ROAS, $4.94 CPA ✅

💰 **Immediate Budget Reallocation:**
Move $500/day from paused campaigns to top 3 performers!

Expected impact: +$2,000 daily revenue increase! 📈`;
    }

    // Best performing campaign questions (PRIORITY 3)
    if (
      userMessage.includes("best") ||
      userMessage.includes("top") ||
      userMessage.includes("highest") ||
      userMessage.includes("migliore") ||
      userMessage.includes("migliori")
    ) {
      console.log("🧠 Detected: Best campaign question");
      return `🏆 **Your Top Performing Campaign**

**"Cyber Monday Exclusive"** is absolutely dominating! 

📊 **Performance Stats:**
• ROAS: **4.75x** 🔥
• Spend: $1,923.78
• Revenue: $9,134.56
• Conversions: 342
• CPA: $5.63

🎯 **Why It's Working:**
• Strong seasonal relevance 
• Compelling offer messaging
• Optimal audience targeting
• Meta Ads platform performing well

💡 **Action Items:**
• **Scale Up:** Increase daily budget by 20-30%
• **Duplicate:** Create similar campaigns for other promotions
• **Test:** Try this creative style on Google Ads too

This campaign is making you $3.75 profit for every $1 spent! 💰`;
    }

    // Worst performing campaign questions (PRIORITY 4)
    if (
      userMessage.includes("worst") ||
      userMessage.includes("bad") ||
      userMessage.includes("poor") ||
      userMessage.includes("attention") ||
      userMessage.includes("problemi") ||
      userMessage.includes("peggiore")
    ) {
      console.log("🧠 Detected: Worst campaign question");
      return `⚠️ **Campaign Needs Attention**

**"Valentine's Day Looks"** is underperforming and needs immediate attention.

📊 **Performance Stats:**
• ROAS: **2.19x** ⚠️ (Below target)
• Spend: $1,456.78
• Revenue: $3,189.45
• Conversions: 134
• CPA: $10.87

🔍 **Issues Identified:**
• Seasonal mismatch (Valentine's theme past relevance)
• High CPA compared to other campaigns
• Low conversion rate
• Creative fatigue likely

💡 **Immediate Actions:**
• **Pause or reduce budget** by 50%
• **Refresh creatives** with current themes
• **Test new audiences** - try lookalikes from top performers
• **Adjust targeting** to exclude low-intent users

Expected improvement: 30-40% ROAS boost with these changes! 🚀`;
    }

    // Optimization and improvement questions (PRIORITY 5)
    if (
      userMessage.includes("optimize") ||
      userMessage.includes("improve") ||
      userMessage.includes("better") ||
      userMessage.includes("ottimizzare") ||
      userMessage.includes("migliorare") ||
      userMessage.includes("suggestions") ||
      userMessage.includes("recommendations") ||
      userMessage.includes("should i") ||
      userMessage.includes("improvements")
    ) {
      console.log("🧠 Detected: Optimization question");
      return `🚀 **Optimization Recommendations**

Based on your campaign data, here are immediate actions:

🎯 **Priority 1: Budget Reallocation**
• Move 30% budget from low ROAS campaigns (< 2.5x) to high performers (4.0x+)
• Focus on "Cyber Monday Exclusive" and similar high-ROAS campaigns

📱 **Priority 2: Creative Refresh**
• "Valentine's Day Looks" needs new creatives - try user-generated content
• Test video ads vs static images
• A/B test different headlines and CTAs

🎪 **Priority 3: Audience Optimization**
• Create lookalike audiences based on your best converters
• Exclude recent converters to avoid audience fatigue
• Test broader interests for scaling

⚡ **Quick Wins:**
• Pause campaigns with ROAS < 2.0x
• Increase bids on campaigns with ROAS > 4.0x
• Add negative keywords to Google Ads campaigns

Expected impact: +15-25% ROAS improvement in 2 weeks! 📈`;
    }

    // Platform-specific questions (PRIORITY 6)
    if (
      userMessage.includes("google ads") ||
      userMessage.includes("meta ads") ||
      userMessage.includes("facebook") ||
      userMessage.includes("platform")
    ) {
      console.log("🧠 Detected: Platform-specific question");
      return `📱 **Platform Performance Comparison**

Here's how your campaigns perform across platforms:

🔍 **Google Ads (16 campaigns):**
• Average ROAS: 3.2x
• Total Spend: $26,432.15
• Total Revenue: $84,582.88
• Best Performer: "Summer Sale Spectacular" (4.61x ROAS)
• Focus: Search intent, Shopping campaigns

📘 **Meta Ads (14 campaigns):**
• Average ROAS: 3.7x
• Total Spend: $28,427.35
• Total Revenue: $109,069.80
• Best Performer: "Cyber Monday Exclusive" (4.75x ROAS)
• Focus: Visual storytelling, lookalike audiences

🎯 **Platform Recommendations:**

**Google Ads:**
• Expand high-performing Shopping campaigns
• Add more negative keywords
• Test Smart Bidding strategies

**Meta Ads:**
• Scale winning creative formats
• Create more lookalike audiences
• Test Reels and video formats

Meta is outperforming Google by 0.5x ROAS currently! 📊`;
    }

    // ROAS specific questions (PRIORITY 7)
    if (userMessage.includes("roas") && !userMessage.includes("overall")) {
      console.log("🧠 Detected: ROAS question");
      return `💰 **ROAS Analysis & Improvement Tips**

Your current 3.44x average ROAS is solid, but we can push it higher!

📊 **ROAS Breakdown:**
• Best: 4.75x (Cyber Monday Exclusive)
• Worst: 2.19x (Valentine's Day Looks)
• Industry Benchmark: ~3.0x ✅ You're above average!

🎯 **ROAS Improvement Strategy:**

**1. Campaign Pruning** 🎨
• Pause campaigns below 2.5x ROAS
• Reallocate budget to 4.0x+ performers

**2. Bid Optimization** 📈
• Switch to Target ROAS bidding
• Set targets: 4.0x for proven campaigns

**3. Audience Quality** 👥
• Use purchase-based lookalikes
• Exclude bargain hunters and freebie seekers

**4. Creative Testing** 🎬
• Test user testimonials and reviews
• Focus on value proposition, not just features

**Target Goal:** 4.0x average ROAS (17% improvement)
**Timeline:** 30 days with consistent optimization 🚀`;
    }

    // Budget questions (PRIORITY 8)
    if (
      userMessage.includes("budget") ||
      userMessage.includes("spend") ||
      userMessage.includes("money") ||
      userMessage.includes("spesa")
    ) {
      console.log("🧠 Detected: Budget question");
      return `💰 **Budget Optimization Strategy**

Current spend: **$54,859.50** generating **$193,652.68** revenue

📊 **Budget Allocation Analysis:**
• Total Daily Budget: ~$1,829 across 30 campaigns
• Average per campaign: ~$61/day
• Best performing campaigns are under-funded
• Worst performers getting too much budget

🎯 **Recommended Reallocation:**

**Increase Budget (+30%):**
• Cyber Monday Exclusive (4.75x ROAS)
• Other 4.0x+ ROAS campaigns

**Reduce Budget (-50%):**
• Valentine's Day Looks (2.19x ROAS)
• Any campaigns below 2.5x ROAS

**Maintain Budget:**
• Campaigns with 3.0-4.0x ROAS

💡 **Expected Impact:**
• +$15,000 monthly revenue
• +0.8x average ROAS improvement
• Better cost efficiency

Ready to implement these changes? 🚀`;
    }

    // Time-based questions
    if (
      userMessage.includes("this month") ||
      userMessage.includes("last week") ||
      userMessage.includes("yesterday") ||
      userMessage.includes("trend") ||
      userMessage.includes("recently")
    ) {
      console.log("🧠 Detected: Time-based question");
      return `📅 **Recent Performance Trends**

Here's what's happening with your campaigns lately:

📈 **This Month:**
• Daily spend: ~$1,829 avg
• Daily revenue: ~$6,455 avg
• ROAS trend: +0.3x improvement
• New campaigns launched: 3

🔥 **Top Trending Campaigns:**
• "Tech Gadgets Galore" - 4.21x ROAS ⬆️
• "End of Season Sale" - 3.87x ROAS ⬆️
• "Beach Ready Collection" - 3.52x ROAS ⬆️

⚠️ **Declining Performance:**
• "Valentine's Day Looks" - 2.19x ROAS ⬇️
• "Summer Style Refresh" - 2.21x ROAS ⬇️

💡 **Weekly Insights:**
• Best day: Tuesday (3.8x avg ROAS)
• Worst day: Sunday (2.9x avg ROAS)
• Peak hours: 7-9 PM (highest conversions)

Your campaigns are showing positive momentum! 🚀`;
    }

    // Comparison questions
    if (
      userMessage.includes("compare") ||
      userMessage.includes("vs") ||
      userMessage.includes("difference") ||
      userMessage.includes("which is")
    ) {
      console.log("🧠 Detected: Comparison question");
      return `⚖️ **Campaign Performance Comparison**

Here are your top vs bottom performers:

🏆 **Top 3 Performers:**
1. **Cyber Monday Exclusive** - 4.75x ROAS
   • Meta Ads • $1,923 spend • 342 conversions
   
2. **Summer Sale Spectacular** - 4.61x ROAS  
   • Google Ads • $572 spend • 35 conversions
   
3. **Tech Gadgets Galore** - 4.21x ROAS
   • Google Ads • $2,345 spend • 378 conversions

⚠️ **Bottom 3 Performers:**
1. **Valentine's Day Looks** - 2.19x ROAS
   • Meta Ads • $1,456 spend • 134 conversions
   
2. **Summer Style Refresh** - 2.21x ROAS
   • Google Ads • $1,151 spend • 138 conversions
   
3. **Festive Fashion Finds** - 2.82x ROAS
   • Google Ads • $1,169 spend • 229 conversions

💰 **The Gap:**
Your best campaign outperforms your worst by **2.56x ROAS**!

Reallocating budget from bottom to top could increase overall ROAS by 25%! 📈`;
    }

    // Conversion and sales questions
    if (
      userMessage.includes("conversion") ||
      userMessage.includes("sales") ||
      userMessage.includes("revenue") ||
      userMessage.includes("customers") ||
      userMessage.includes("orders")
    ) {
      console.log("🧠 Detected: Conversion question");
      return `💰 **Conversions & Sales Analysis**

Your conversion performance breakdown:

📊 **Overall Conversion Metrics:**
• Total Conversions: 6,247 across all campaigns
• Average Conversion Rate: 2.8%
• Total Revenue: $193,652.68
• Average Order Value: $31.02

🏆 **Best Converting Campaigns:**
• **Tech Gadgets Galore** - 378 conversions
• **Cyber Monday Exclusive** - 342 conversions  
• **Back-to-School Essentials** - 350 conversions

📈 **Conversion Rate Leaders:**
• **Weekend Wardrobe Refresh** - 4.2% CR
• **Flash Weekend Deals** - 3.8% CR
• **Spring Launch Collection** - 3.6% CR

💡 **Optimization Opportunities:**
• Landing page A/B testing
• Checkout flow optimization
• Retargeting cart abandoners
• Email follow-up sequences

Target: Increase overall conversion rate to 3.5% (+25% more sales)! 🎯`;
    }

    // Audience and targeting questions
    if (
      userMessage.includes("audience") ||
      userMessage.includes("targeting") ||
      userMessage.includes("demographics") ||
      userMessage.includes("who") ||
      userMessage.includes("customers")
    ) {
      console.log("🧠 Detected: Audience question");
      return `👥 **Audience & Targeting Insights**

Here's who's converting on your campaigns:

🎯 **Top Converting Audiences:**
• Lookalike (1% - Purchase) - 4.2x ROAS
• Interest: Fashion & Style - 3.8x ROAS  
• Custom: Website Visitors (30 days) - 3.6x ROAS
• Age: 25-44 performs best across all campaigns

📊 **Demographic Breakdown:**
• **Age:** 25-34 (42%), 35-44 (31%), 18-24 (17%)
• **Gender:** 68% Female, 32% Male
• **Locations:** Urban areas outperform by 23%
• **Devices:** Mobile 71%, Desktop 29%

💰 **High-Value Segments:**
• Premium subscribers: 5.2x ROAS
• Repeat customers: 6.1x ROAS
• Newsletter subscribers: 4.7x ROAS

🚀 **Expansion Opportunities:**
• Create more lookalike audiences from top performers
• Test interest stacking
• Expand to similar demographic groups
• Try broad targeting with smart bidding

Your lookalike audiences are goldmines! 💎`;
    }

    // Creative and ad copy questions
    if (
      userMessage.includes("creative") ||
      userMessage.includes("ad copy") ||
      userMessage.includes("images") ||
      userMessage.includes("video") ||
      userMessage.includes("text")
    ) {
      console.log("🧠 Detected: Creative question");
      return `🎨 **Creative Performance Analysis**

Your ad creatives breakdown and optimization tips:

📊 **Top Performing Creative Types:**
• **User-Generated Content** - 4.8x avg ROAS
• **Product Showcase Videos** - 4.2x avg ROAS
• **Before/After Images** - 3.9x avg ROAS
• **Lifestyle Photography** - 3.4x avg ROAS

🔥 **Best Performing Elements:**
• **Headlines:** "Limited Time" performs 34% better
• **CTAs:** "Shop Now" outperforms "Learn More" by 22%
• **Colors:** Red/Orange buttons get 18% more clicks
• **Video Length:** 15-30 seconds optimal

⚠️ **Creative Fatigue Indicators:**
• CTR dropped 15% on "Valentine's Day Looks"
• Frequency 3+ on older campaigns
• CPC increasing on static image ads

💡 **Creative Refresh Strategy:**
• Test 3-5 new creatives weekly
• Rotate seasonal themes monthly  
• Add customer testimonials
• Create video versions of top static ads
• Test carousel vs single image formats

Fresh creatives = Higher performance! 🚀`;
    }

    // Seasonal and trending questions
    if (
      userMessage.includes("season") ||
      userMessage.includes("trending") ||
      userMessage.includes("holiday") ||
      userMessage.includes("summer") ||
      userMessage.includes("winter") ||
      userMessage.includes("trends")
    ) {
      console.log("🧠 Detected: Seasonal question");
      return `🌟 **Seasonal Performance & Trends**

Your campaigns' seasonal insights and upcoming opportunities:

📅 **Current Season Performance:**
• **Spring/Summer themes:** 3.8x avg ROAS
• **Year-round products:** 3.2x avg ROAS
• **Seasonal promotions:** 4.1x avg ROAS

🏆 **Best Seasonal Campaigns:**
• **Cyber Monday Exclusive** - 4.75x ROAS
• **Summer Sale Spectacular** - 4.61x ROAS
• **Spring Launch Collection** - 3.78x ROAS

📈 **Upcoming Opportunities:**
• **Back-to-School (Aug):** High potential
• **Fall Fashion (Sep):** Start creative prep now
• **Holiday Season (Nov-Dec):** Begin planning
• **New Year (Jan):** Fitness/lifestyle trends

💡 **Seasonal Strategy:**
• Pause off-season campaigns ("Valentine's Day")
• Create summer collection campaigns
• Prepare fall/winter creatives
• Plan holiday promotional calendar

🎯 **Quick Wins:**
• Launch "Summer Essentials" campaign
• Create "Beat the Heat" promotion
• Test beach/vacation themes
• Add seasonal urgency to copy

Seasonal relevance = Higher conversions! ☀️`;
    }

    // Performance and overview questions (PRIORITY 9 - More specific now)
    if (
      (userMessage.includes("performance") &&
        (userMessage.includes("overall") || userMessage.includes("general"))) ||
      (userMessage.includes("how are") && userMessage.includes("campaigns")) ||
      userMessage.includes("metriche") ||
      userMessage.includes("spesa totale") ||
      userMessage.includes("ricavo") ||
      userMessage.includes("january") ||
      userMessage.includes("gennaio") ||
      userMessage.includes("total spend") ||
      userMessage.includes("total revenue") ||
      (userMessage.includes("ctr") && userMessage.includes("cpa"))
    ) {
      console.log("🧠 Detected: General performance/overview question");
      return `📊 **Campaign Performance Overview**

Hey! Based on your current data, here's how your campaigns are performing:

💰 **Financial Performance:**
• Total Spend: $54,859.50
• Total Revenue: $193,652.68
• **Overall ROAS: 3.44x** ✅ (Above industry average!)

📈 **Key Metrics:**
• Active Campaigns: 30 campaigns
• Google Ads: 16 campaigns
• Meta Ads: 14 campaigns
• Average CTR: ~2.8%
• Average CPA: ~$7.50

🏆 **Top Performer:**
**"Cyber Monday Exclusive"** - 4.75x ROAS
This campaign is crushing it! Consider allocating more budget here.

⚠️ **Needs Attention:**
**"Valentine's Day Looks"** - 2.19x ROAS
This one needs optimization or budget reduction.

💡 **Quick Recommendations:**
• Scale up budget on campaigns with 4.0+ ROAS
• Pause or optimize campaigns below 2.5x ROAS
• Test new creatives for underperforming campaigns

Want me to dive deeper into any specific area? 🚀`;
    }

    // Default response for unclear questions
    console.log("🧠 Using default response for:", userMessage.substring(0, 50));
    return `🤖 **AI Assistant Ready!**

I'm here to help optimize your advertising campaigns! I have access to your complete campaign data.

📊 **Your Portfolio:**
• 30 active campaigns ($54K spend, $194K revenue)
• 3.44x average ROAS across Google Ads & Meta
• Best performer: "Cyber Monday Exclusive" (4.75x ROAS)

💡 **What I can help with:**
• Campaign performance analysis
• ROAS optimization strategies  
• Budget allocation recommendations
• Creative and audience insights
• Platform-specific best practices

Try asking:
• "Which campaigns should I optimize?"
• "What's my worst performing campaign?"
• "How can I scale my best performers?"
• "Show me budget recommendations"

Ready to boost your advertising ROI? 🚀`;
  }

  async generateCampaignInsights(campaignData: any): Promise<string> {
    const systemPrompt = `You are an AI advertising optimization expert. Analyze the provided campaign data and generate actionable insights and recommendations. Focus on:
    - Performance metrics analysis (CTR, CPC, CPA, ROAS)
    - Budget optimization opportunities
    - Audience targeting improvements
    - Creative performance suggestions
    - Bidding strategy recommendations
    
    Provide specific, actionable recommendations with expected impact.`;

    const userPrompt = `Analyze this campaign data and provide optimization insights:
    ${JSON.stringify(campaignData, null, 2)}`;

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  }

  async generateDashboardSummary(metricsData: any): Promise<string> {
    const systemPrompt = `You are an AI marketing analyst. Create a concise dashboard summary highlighting key performance indicators, trends, and immediate action items. Keep it professional but conversational.`;

    const userPrompt = `Generate a dashboard summary for this advertising data:
    ${JSON.stringify(metricsData, null, 2)}`;

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  }

  async answerQuestion(question: string, context: any): Promise<string> {
    const isAICommand = context.isAICommand || false;
    const isMockData = context.isMockData || false;

    const systemPrompt = `You are an expert AI advertising consultant with deep knowledge of digital marketing across platforms like Meta Ads, Google Ads, TikTok Ads, and LinkedIn Ads. 

    ${
      isAICommand
        ? `The user is asking for advertising optimization tips via a Telegram bot command. Provide concise, actionable advice (max 500 words) with:
      • Specific optimization tactics
      • Expected ROI/ROAS improvements 
      • Platform-specific recommendations
      • Quick implementation steps
      
      Use emojis and bullet points for readability in Telegram.`
        : `Answer questions about advertising campaign performance, optimization strategies, and marketing insights using the provided context data.`
    }
    
    ${
      isMockData
        ? `You are analyzing DEMO campaign data for a user named ${
            context.userName || "User"
          }. The data includes:
      - ${
        context.campaignSummary?.totalCampaigns || "Multiple"
      } campaigns across Google Ads and Meta Ads
      - Total spend: $${
        context.campaignSummary?.totalSpend?.toLocaleString() || "54,859"
      }
      - Total revenue: $${
        context.campaignSummary?.totalRevenue?.toLocaleString() || "193,652"
      }
      - Average ROAS: ${context.campaignSummary?.averageRoas || "3.44"}x
      - Best performing: ${
        context.campaignSummary?.bestCampaign?.name || "Cyber Monday Exclusive"
      } (${
            context.campaignSummary?.bestCampaign?.metrics?.roas || "4.75"
          }x ROAS)
      - Worst performing: ${
        context.campaignSummary?.worstCampaign?.name || "Valentine's Day Looks"
      } (${
            context.campaignSummary?.worstCampaign?.metrics?.roas || "2.19"
          }x ROAS)
      
      Provide specific insights and actionable recommendations based on this performance data.`
        : ""
    }
    
    Key expertise areas:
    - ROAS & CPA optimization
    - Audience targeting & lookalike audiences  
    - Creative testing & ad fatigue management
    - Bidding strategies (CBO, ABO, Target CPA, etc.)
    - Attribution & tracking setup
    - Platform-specific best practices
    - Budget allocation & scaling strategies`;

    let userPrompt = "";

    if (isMockData && context.campaignSummary) {
      userPrompt = `User Question: ${question}

Campaign Performance Summary:
- Total Campaigns: ${context.campaignSummary.totalCampaigns}
- Total Spend: $${context.campaignSummary.totalSpend?.toLocaleString()}
- Total Revenue: $${context.campaignSummary.totalRevenue?.toLocaleString()}
- Average ROAS: ${context.campaignSummary.averageRoas}x
- Google Ads Campaigns: ${context.campaignSummary.googleCampaigns}
- Meta Ads Campaigns: ${context.campaignSummary.metaCampaigns}

Top Performer: ${context.campaignSummary.bestCampaign?.name} - ${
        context.campaignSummary.bestCampaign?.metrics?.roas
      }x ROAS
Needs Attention: ${context.campaignSummary.worstCampaign?.name} - ${
        context.campaignSummary.worstCampaign?.metrics?.roas
      }x ROAS

Based on this campaign data, provide specific, actionable optimization recommendations.`;
    } else if (context.recentMetrics && context.recentMetrics.length > 0) {
      userPrompt = `Campaign Context: ${JSON.stringify(
        context.recentMetrics.slice(0, 5),
        null,
        2
      )}
      
Question: ${question}`;
    } else {
      userPrompt = `Question: ${question}
      
${
  isAICommand
    ? "Note: User doesn't have campaign data connected yet. Provide general advertising optimization best practices."
    : "Context: No campaign data available."
}`;
    }

    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
  }
}

export const deepseek = new DeepseekClient();
