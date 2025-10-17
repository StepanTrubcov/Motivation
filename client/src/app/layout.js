import { ReduxProvider } from '@/redux/provider';
import { Toaster } from 'react-hot-toast';
import { BottomNavProvider } from '@/context/BottomNavContext';
import BottomNavWrapper from '@/components/BottomNav/BottomNavWrapper';
import DataInitializer from '@/components/DataInitializer/DataInitializer';
import '@/styles/App.css';
import '@/styles/index.css';
import './globals.css';

export const metadata = {
  title: 'Motivation App - Достигай целей каждый день',
  description: 'Приложение для отслеживания целей, достижений и прогресса',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <BottomNavProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <DataInitializer>
              {children}
            </DataInitializer>
            <BottomNavWrapper />
          </BottomNavProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
