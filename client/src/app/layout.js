import { ReduxProvider } from '@/redux/provider';
import SingleToastToaster from '@/components/Toast/SingleToastToaster';
import { BottomNavProvider } from '@/context/BottomNavContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { TutorialProvider } from '@/context/TutorialContext';
import BottomNavWrapper from '@/components/BottomNav/BottomNavWrapper';
import DataInitializer from '@/components/DataInitializer/DataInitializer';
import TutorialOverlay from '@/components/Tutorial/TutorialOverlay';
import TutorialRouteSync from '@/components/Tutorial/TutorialRouteSync';
import '@/styles/App.css';
import '@/styles/index.css';
import './globals.css';

export const metadata = {
  title: 'Motivation App - Достигай целей каждый день',
  description: 'Приложение для отслеживания целей, достижений и прогресса',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <meta name="color-scheme" content="dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var c = localStorage.getItem('app-accent-color');
                  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
                    var r = parseInt(c.slice(1,3), 16), g = parseInt(c.slice(3,5), 16), b = parseInt(c.slice(5,7), 16);
                    document.documentElement.style.setProperty('--accent-green', c);
                    document.documentElement.style.setProperty('--accent-green-glow', 'rgba(' + r + ',' + g + ',' + b + ',0.8)');
                    document.documentElement.style.setProperty('--accent-green-muted', 'rgba(' + r + ',' + g + ',' + b + ',0.25)');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="telegram-dark">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app-theme') || 'dark';
                  var root = document.documentElement;
                  var body = document.body;
                  if (theme === 'light') {
                    root.classList.remove('dark-theme');
                    root.classList.add('light-theme');
                    body.classList.remove('telegram-dark');
                    body.classList.add('telegram-light');
                    root.style.colorScheme = 'light';
                  } else {
                    root.classList.remove('light-theme');
                    root.classList.add('dark-theme');
                    body.classList.remove('telegram-light');
                    body.classList.add('telegram-dark');
                    root.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <LanguageProvider>
          <ThemeProvider>
            <ReduxProvider>
              <TutorialProvider>
                <TutorialRouteSync />
                <BottomNavProvider>
                  <div data-tutorial-id="toast-messages" style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', minWidth: 280, minHeight: 80, zIndex: 9999 }} aria-hidden>
                  <SingleToastToaster />
                </div>
                  <DataInitializer>
                    {children}
                  </DataInitializer>
                  <BottomNavWrapper />
                </BottomNavProvider>
                <TutorialOverlay />
              </TutorialProvider>
            </ReduxProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}