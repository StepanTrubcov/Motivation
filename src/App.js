import React, { useEffect, useState } from 'react';
import './App.css';
import ProfileConteiner from './Component/Profile/ProfileConteiner';
import { addProfile } from './Api/Api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    addProfile(setUser);
  }, []);

  if (!user) {
    return <div className="App">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="App">
      <ProfileConteiner user={user} />
      <div>
      <h2>{user.first_name} {user.last_name}</h2>
      <p>@{user.username}</p>
      <p>ID: {user.id}</p>
    </div>
    </div>
  );
}

export default App;