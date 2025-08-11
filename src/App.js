import React, { useEffect, useState } from 'react';
import  WebApp  from '@twa-dev/sdk';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const webApp = new WebApp();
      webApp.ready();

      const tgUser = webApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser);
      } else {
        setError('Данные пользователя не найдены.');
      }
    } catch (err) {
      setError('Ошибка инициализации: ' + err.message);
    }
  }, []);

  if (error) {
    return <div className="App">Ошибка: {error}</div>;
  }

  if (!user) {
    return <div className="App">Загрузка данных пользователя...</div>;
  }

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
