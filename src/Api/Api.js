import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import { collection, getDocs } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";

export const addProfileApi = async (setProfile) => {
  WebApp.ready();

  const userData = WebApp.initDataUnsafe?.user || {
    id: "5102803347",
    first_name: "Stefan",
    username: "Stepan4853",
    photo_url: "https://t.me/i/userpic/320/oBN9n-AW0sT2iVFeGc17067iUAw_QccFVfwQefEbwRJFd3WRBg0IiDoe6whGY1zK.svg"
  };
  console.log(userData)
  if (!userData) {
    console.error("Нет данных пользователя от Telegram");
    return;
  }

  try {
    const postResponse = await axios.post("https://97a4b39a082c.ngrok-free.app/api/users", {
      telegramId: userData.id,
      firstName: userData.first_name,
      username: userData.username
    });
    console.log('POST response:', postResponse.data);


    const getResponse = await axios.get(`https://97a4b39a082c.ngrok-free.app/api/users/${userData.id}`);
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


export async function getAllGoals(db, customUserId) {
  try {
    const querySnapshot = await getDocs(collection(db, "users", customUserId, "goals"));
    const goals = querySnapshot.docs.map(doc => doc.data());
    return goals;
  } catch (error) {
    console.error("Ошибка получения целей:", error);
    return [];
  }
}

export async function getAllStatus(db, customUserId, goalId, newStatus) {
  try {
    const goalRef = doc(db, "users", customUserId, "goals", goalId.toString());
    const updateData = { status: newStatus };

    if (newStatus === "done") {
      updateData.completionDate = new Date().toISOString().slice(0, 10);
    } else {
      updateData.completionDate = null;
    }

    await updateDoc(goalRef, updateData);
    console.log(`Статус цели ${goalId} для пользователя ${customUserId} изменён на ${newStatus}`);
  } catch (error) {
    console.error(`Ошибка обновления статуса цели ${goalId}:`, error);
    throw error;
  }
}