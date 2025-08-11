import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Данные от Telegram WebApp
    const tgUser = WebApp.initDataUnsafe?.user;
    setUser(tgUser);
  }, []);

  if (!user) {
    return <div className="App">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="App">
      <h1>Добро пожаловать, {user.first_name}!</h1>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Username:</strong> @{user.username || 'нет username'}</p>
      <p><strong>Имя:</strong> {user.first_name} {user.last_name || ''}</p>
      {user}
    </div>
  );
}

export default App;