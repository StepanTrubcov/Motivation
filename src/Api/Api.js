import WebApp from '@twa-dev/sdk';

export const addProfile = async (setUser) => {
    const tg = window.Telegram.WebApp;
    const userData = tg.initDataUnsafe?.user;
  
    if (!userData) {
      console.error("Нет данных пользователя от Telegram");
      return;
    }
  
    // Сохраняем пользователя в БД
    await fetch("http://localhost:5000/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
  
    // Получаем данные из БД
    const res = await fetch(`http://localhost:5000/api/profile/${userData.id}`);
    const data = await res.json();
  
    setUser(data);
  };