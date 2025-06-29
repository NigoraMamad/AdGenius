// Test script for Ad Genius Telegram Bot
// Run with: node src/scripts/test-bot.js

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_TEST_CHAT_ID; // Your Telegram chat ID for testing

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment');
  process.exit(1);
}

if (!CHAT_ID) {
  console.log('⚠️  TELEGRAM_TEST_CHAT_ID not provided. Will skip message tests.');
}

async function testBotSetup() {
  console.log('🤖 Testing Ad Genius Bot Setup...\n');

  try {
    // Test 1: Get bot info
    console.log('1. Getting bot information...');
    const botInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botInfo.json();
    
    if (botData.ok) {
      console.log(`✅ Bot connected: @${botData.result.username}`);
      console.log(`   Name: ${botData.result.first_name}`);
    } else {
      console.log('❌ Failed to get bot info:', botData.description);
      return;
    }

    // Test 2: Set bot commands
    console.log('\n2. Setting bot commands...');
    const commands = [
      { command: "start", description: "Show welcome message & dashboard button" },
      { command: "ai", description: "Ask AI for ad-optimization tips" },
      { command: "help", description: "Display usage instructions" }
    ];

    const setCommands = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });

    const commandsData = await setCommands.json();
    if (commandsData.ok) {
      console.log('✅ Bot commands set successfully');
      commands.forEach(cmd => console.log(`   /${cmd.command} - ${cmd.description}`));
    } else {
      console.log('❌ Failed to set commands:', commandsData.description);
    }

    // Test 3: Get current commands
    console.log('\n3. Verifying current commands...');
    const getCommands = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMyCommands`);
    const currentCommands = await getCommands.json();
    
    if (currentCommands.ok) {
      console.log('✅ Current bot commands:');
      currentCommands.result.forEach(cmd => 
        console.log(`   /${cmd.command} - ${cmd.description}`)
      );
    }

    // Test 4: Send test message (if chat ID provided)
    if (CHAT_ID) {
      console.log('\n4. Sending test message...');
      const testMessage = {
        chat_id: CHAT_ID,
        text: "🧪 **Bot Test Message**\n\nAd Genius Bot is working correctly!\n\nTry these commands:\n• /start\n• /ai How to improve ROAS?\n• /help",
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🚀 Open Dashboard",
              web_app: { url: "https://t.me/ad_genius_bot/adoptimizer" }
            }
          ]]
        }
      };

      const sendTest = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage)
      });

      const sendData = await sendTest.json();
      if (sendData.ok) {
        console.log('✅ Test message sent successfully');
      } else {
        console.log('❌ Failed to send test message:', sendData.description);
      }
    }

    console.log('\n🎉 Bot setup complete! Your bot is ready to use.');
    console.log('\n📱 To test the bot:');
    console.log('1. Open Telegram and find your bot');
    console.log('2. Send /start to see the welcome message');
    console.log('3. Try /ai How to improve my Facebook ads?');
    console.log('4. Use /help to see all commands');

  } catch (error) {
    console.error('❌ Error during bot setup:', error);
  }
}

// Run the test
testBotSetup(); 