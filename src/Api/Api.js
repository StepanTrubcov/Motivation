import WebApp from '@twa-dev/sdk';

export const addProfile = async (setUser) => {
        WebApp.ready();

        const userData = WebApp.initDataUnsafe?.user;
      console.log(WebApp)
      console.log(WebApp.initDataUnsafe)
        if (!userData) {
          console.error("Нет данных пользователя от Telegram");
          return;
        }
      
        // Сохраняем пользователя в БД
        await fetch(" https://f748cd9be673.ngrok-free.app/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        });
      
        // Получаем данные из БД
        const res = await fetch(` https://f748cd9be673.ngrok-free.app/api/profile/${userData.id}`);
        const data = await res.json();
      
        setUser(data);
}