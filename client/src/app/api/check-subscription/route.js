import { NextResponse } from 'next/server';

// Get bot token and channel from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

if (!CHANNEL_ID) {
  console.error('TELEGRAM_CHANNEL_ID is not set in environment variables');
}

/**
 * Checks if a user is subscribed to the Telegram channel
 * @param {number} userId - The Telegram user ID to check
 * @returns {Promise<boolean>} - True if user is subscribed, false otherwise
 */
async function isSubscribed(userId) {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.error('Bot token or channel ID not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          user_id: userId
        })
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Error from Telegram API:', data);
      return false;
    }

    const status = data.result.status;
    const subscribedStatuses = ['member', 'administrator', 'creator'];
    
    return subscribedStatuses.includes(status);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      );
    }

    // Validate that userId is a number
    const numericUserId = Number(userId);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId format' }, 
        { status: 400 }
      );
    }

    const subscribed = await isSubscribed(numericUserId);

    return NextResponse.json({ 
      subscribed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in check-subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}