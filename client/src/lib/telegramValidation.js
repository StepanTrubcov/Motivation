import { telegramIdentity } from './telegramAuth.mjs';
export function validateTelegramWebAppData(initData, botToken) {
  return Boolean(telegramIdentity(initData, botToken));
}
