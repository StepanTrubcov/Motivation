import { useState, useEffect } from 'react';

const SubscriptionGate = ({ children, channelId = '@your_channel_username', channelLink = 'https://t.me/your_channel_username' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showNativeBlocker, setShowNativeBlocker] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id);
        checkSubscription(user.id);
      } else {
        setIsLoading(false);
        setSubscribed(false);
        showSubscriptionPopup();
      }
    } else {
      setIsLoading(false);
      setSubscribed(false);
    }
  }, []);

  const checkSubscription = async (userId) => {
    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.subscribed) {
        setSubscribed(true);
        setIsLoading(false);
      } else {
        setSubscribed(false);
        setIsLoading(false);
        showSubscriptionPopup();
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setIsLoading(false);
      showSubscriptionPopup();
    }
  };

  const showSubscriptionPopup = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      tg.showPopup({
        title: 'Доступ ограничен',
        message: 'Чтобы пользоваться приложением, подпишитесь на наш канал',
        buttons: [
          { id: 'subscribe', type: 'default', text: 'Подписаться' },
          { id: 'recheck', type: 'default', text: 'Проверить подписку' },
          { id: 'cancel', type: 'cancel' }
        ]
      }, (buttonId) => {
        if (buttonId === 'subscribe') {
          tg.openTelegramLink(channelLink);
        } else if (buttonId === 'recheck') {
          if (userId) {
            checkSubscription(userId);
          } else {
            // Пытаемся получить userId снова
            const user = tg.initDataUnsafe?.user;
            if (user) {
              setUserId(user.id);
              checkSubscription(user.id);
            }
          }
        } else if (buttonId === 'cancel') {
          // Можно закрыть приложение или оставить на экране блокировки
          tg.close();
        }
      });
    }
  };

  const forceShowSubscriptionPopup = () => {
    showSubscriptionPopup();
  };

  // Если пользователь не подписан, показываем пустой экран и вызываем popup
  if (!subscribed) {
    useEffect(() => {
      if (!isLoading) {
        const timer = setTimeout(() => {
          if (!subscribed) {
            forceShowSubscriptionPopup();
          }
        }, 500); // Небольшая задержка, чтобы UI успел загрузиться
        
        return () => clearTimeout(timer);
      }
    }, [subscribed, isLoading]);

    // Показываем минимальный интерфейс, пока пользователь решает
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#1c1c1e', 
        color: 'white',
        fontSize: '16px'
      }}>
        {!isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <p>Проверка подписки...</p>
            <button 
              onClick={forceShowSubscriptionPopup}
              style={{
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              Открыть проверку
            </button>
          </div>
        ) : (
          <p>Загрузка...</p>
        )}
      </div>
    );
  }

  return children;
};

export default SubscriptionGate;