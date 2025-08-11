import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Проверяем, инициализирован ли Telegram Web Apps SDK
      if (WebApp && WebApp.initDataUnsafe) {
        const tgUser = WebApp.initDataUnsafe.user;
        if (tgUser) {
          setUser(tgUser);
        } else {
          setError('Данные пользователя не найдены.');
        }
      } else {
        setError('Telegram Web Apps SDK не инициализирован. Пожалуйста, откройте приложение через Telegram.');
      }

      // Сообщаем Telegram, что приложение готово
      WebApp.ready();
    } catch (err) {
      setError('Ошибка инициализации: ' + err.message);
    }
  }, []);

  // Если есть ошибка, отображаем её
  if (error) {
    return <div className="App">Ошибка: {error}</div>;
  }

  // Если пользователь не загружен, показываем сообщение о загрузке
  if (!user) {
    return <div className="App">Загрузка данных пользователя...</div>;
  }

  // Отображаем данные пользователя
  return (
    <div className="App">
      <h1>Добро пожаловать, {user.first_name}!</h1>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Username:</strong> @{user.username || 'нет username'}</p>
      <p><strong>Имя:</strong> {user.first_name} {user.last_name || ''}</p>
    </div>
  );
}

export default App;