import crypto from 'crypto';

/**
 * Validates Telegram WebApp initData to prevent unauthorized access
 * @param {string} initData - The Telegram WebApp initData string
 * @param {string} botToken - The bot token
 * @returns {boolean} - True if validation passes, false otherwise
 */
export function validateTelegramWebAppData(initData, botToken) {
  if (!initData) return false;

  try {
    // Parse the initData
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    const signature = urlParams.get('signature');
    
    // Create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .filter(([key]) => key !== 'hash')
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');
    
    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Calculate hash
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    // Compare hashes
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return false;
  }
}