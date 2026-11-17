import axios from 'axios';
const http = axios.create({ timeout: 15000 });
http.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) config.headers.set('x-telegram-init-data', webApp.initData);
    else if (process.env.NODE_ENV === 'development') config.headers.set('x-development-telegram-id', String(webApp?.initDataUnsafe?.user?.id || 123));
  }
  return config;
});
export default http;
