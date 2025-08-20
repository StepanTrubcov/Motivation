import WebApp from '@twa-dev/sdk';
import axios from 'axios';

export const addProfileApi = async (setProfile) => {
  WebApp.ready();

  const userData = WebApp.initDataUnsafe?.user || {
    id: "5102803347",
    first_name: "Stefan",
    username: "Stepan4853",
    photo_url: "https://t.me/i/userpic/320/oBN9n-AW0sT2iVFeGc17067iUAw_QccFVfwQefEbwRJFd3WRBg0IiDoe6whGY1zK.svg"
  };

  if (!userData) {
    console.error("Нет данных пользователя от Telegram");
    return;
  }

  try {
    const postResponse = await axios.post("https://9130bb41d35c.ngrok-free.app/api/users", {
        telegramId: userData.id,
        firstName: userData.first_name,
        username: userData.username
      });
    console.log('POST response:', postResponse.data);

    
    const getResponse = await axios.get(`https://9130bb41d35c.ngrok-free.app/api/users/${userData.id}`);
    console.log('GET response:', getResponse.data);

    return getResponse.data;
  } catch (error) {
    console.error('Error in addProfile:', {
      message: error.message,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null
    });
    throw error;
  }
};