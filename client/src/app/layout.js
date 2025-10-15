import { ReduxProvider } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';
import '@/styles/App.css';
import '@/styles/index.css';
import './globals.css';

export const metadata = {
  title: 'Motivation App - Достигай целей каждый день',
  description: 'Приложение для отслеживания целей, достижений и прогресса',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>
        <ReduxProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
