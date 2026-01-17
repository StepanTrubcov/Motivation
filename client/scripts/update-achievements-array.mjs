#!/usr/bin/env node

// Script to update achievements array in Api.js with the new achievements data
import fs from 'fs';
import path from 'path';

// New achievements array from the selected code
const newAchievements = [
  {
    "id": "1",
    "title": "Красавчик!",
    "description": "",
    "rarity": "common",
    "status": "my",
    "image": 'https://i.postimg.cc/269msf3B/image-(1).jpg',
    "gif": 'https://i.postimg.cc/zfr8v0t6/Untitled-kopia-3.gif',
    "points": 0
  },
  {
    "id": "2",
    "title": "30 дней бега",
    "gif": "https://i.postimg.cc/0yN7300y/Untitled-kopia-4.gif",
    "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/MpCkKwQK/899d46fe-fff2-45d0-85c8-1bafc42b7159.png',
    "points": 250,
    "type": "goal_based",
    "goalIds": ["1"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "3",
    "title": "Книжный марафон",
    "gif": "https://i.postimg.cc/BZV3Hq7c/Untitled-kopia-9.gif",
    "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/YScT80Q1/image-(2).jpg',
    "points": 250,
    "type": "goal_based",
    "goalIds": ["2"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "4",
    "title": "Кодерский марафон",
    "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/d0kBmqFQ/image-(1).jpg',
    "gif": "https://i.postimg.cc/8cFqt6Xc/Untitled-kopia.gif",
    "points": 250,
    "type": "goal_based",
    "goalIds": ["4"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "5",
    "title": "Здоровый рацион",
    "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/prdSyFMC/image-(1)-kopia.jpg',
    "points": 250,
    "type": "goal_based",
    "goalIds": ["68"],
    "rarity": "common",
    "target": 30,
    "gif": "https://i.postimg.cc/cLsNNrr2/Untitled-(3).gif",
  },
  {
    "id": "6",
    "title": "Ранний старт",
    "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/dtLXYrB6/image-kopia.jpg",
    "gif": "https://i.postimg.cc/jj1VNcZx/Untitled234.gif",
    "points": 250,
    "type": "goal_based",
    "goalIds": ["36"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "7",
    "title": "Ледяная закалка",
    "gif": "https://i.postimg.cc/tgjnbdh9/Untitled-kopia-6.gif",
    "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/nLtwB5tT/dddbeae1-1d89-463d-a5e3-91d2b9e6adaa.png",
    "points": 250,
    "type": "goal_based",
    "goalIds": ["16"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "8",
    "gif": "https://i.postimg.cc/PqyJkgXg/Untitled2312.gif",
    "title": "Сила отжиманий",
    "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 30 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/SN2Z5qSL/image-kopia-2.jpg",
    "points": 250,
    "type": "goal_based",
    "goalIds": ["8"],
    "rarity": "common",
    "target": 30
  },
  {
    "id": "9",
    "gif": "https://i.postimg.cc/jjfHJ2CP/2.gif",
    "title": "Месяц прогресса",
    "requirement": "• Пользоваться ботом и приложением \n на протяжении 30 дней\n",
    "status": "locked",
    "image": "https://i.postimg.cc/SNQftmtq/d53eaa62-bd66-4b4c-b2a3-d1706214cb33.png",
    "points": 300,
    "type": "time_based",
    "rarity": "common",
    "target": 30
  },
  //__________________________________________
  // Редкие
  {
    "id": "10",
    "title": "60 дней бега",
    "gif": "https://i.postimg.cc/L8RxsWKW/Untitled-(1).gif",
    "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/HkhH4Tkq/12d6730e-ce3c-4b7e-a7ed-e3728d47a448-kopia.png',
    "points": 500,
    "type": "goal_based",
    "goalIds": ["1"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "11",
    "title": "Книжный марафон",
    "gif": "https://i.postimg.cc/SNbrZPsp/Untitled-(1)-kopia.gif",
    "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/bNYj7ZGC/image-(3).jpg',
    "points": 500,
    "type": "goal_based",
    "goalIds": ["2"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "12",
    "gif": "https://i.postimg.cc/Qd0Jdxqg/Untitled.gif",
    "title": "Кодерский марафон",
    "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/fWKGfMHc/077e34ab-3f3e-422b-b45e-cc308ec45db5.png',
    "points": 500,
    "type": "goal_based",
    "goalIds": ["4"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "13",
    "gif": "https://i.postimg.cc/3NXg5KR7/Untitled-kopia-10.gif",
    "title": "Здоровый рацион",
    "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/sgBbz7VV/image.jpg',
    "points": 500,
    "type": "goal_based",
    "goalIds": ["68"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "14",
    "gif": "https://i.postimg.cc/5NmwsNDM/Untitled-kopia23423.gif",
    "title": "Ранний старт",
    "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 60 раз\n",
    "status": "my",
    "image": "https://i.postimg.cc/cJwjgWgm/image-(1)-kopia-2.jpg",
    "points": 500,
    "type": "goal_based",
    "goalIds": ["36"],
    "rarity": "rare",
    "target": 60
  },
  {
    "gif": "https://i.postimg.cc/bYxbvwzK/Untitled-kopia-7.gif",
    "id": "15",
    "title": "Ледяная закалка",
    "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/C5P6TLXZ/78478168-36c0-45f4-99c8-366e0baa665c.png",
    "points": 500,
    "type": "goal_based",
    "goalIds": ["16"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "16",
    "title": "Сила отжиманий ",
    "gif": "https://i.postimg.cc/DZ5xLw2P/345.gif",
    "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 60 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/yY2vF5zG/image-(1)-kopia-3.jpg",
    "points": 500,
    "type": "goal_based",
    "goalIds": ["8"],
    "rarity": "rare",
    "target": 60
  },
  {
    "id": "17",
    "title": "Полгода прогресса",
    "gif": "https://i.postimg.cc/RZ49HDkt/Untitled-kopia-11.gif",
    "requirement": "• Пользоваться ботом и приложением \n на протяжении 180 дней\n",
    "status": "locked",
    "image": "https://i.postimg.cc/26f4dYZ6/image-kopia-3.jpg",
    "points": 800,
    "type": "time_based",
    "rarity": "rare",
    "target": 180
  },
  //_________________________________________
  // Легендарные
  {
    "id": "18",
    "title": "120 дней бега",
    "gif": "https://i.postimg.cc/fTxhF1vn/Untitled-kopia-5.gif",
    "requirement": "• Взять себе цель «Пробежать 1 км»\n• Выполнить эту цель 120 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/jdWbXLDd/abc30db4-c0ce-4e0a-ac5d-d66933c97033-kopia.png',
    "points": 1000,
    "type": "goal_based",
    "goalIds": ["1"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "19",
    "title": "Ледяная закалка",
    "requirement": "• Взять себе цель «Облиться ❄️ водой»\n• Выполнить эту цель 120 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/hGnRcspW/73664e2a-ece4-40a0-b985-ec6e31d57a4c.png",
    "points": 1000,
    "gif": "https://i.postimg.cc/XJpbzJsw/Untitled-kopia-8.gif",
    "type": "goal_based",
    "goalIds": ["16"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "20",
    "title": "Кодерский марафон",
    "requirement": "• Взять себе цель «Кодить 1 час на 💻»\n• Выполнить эту цель 90 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/nhngk9R3/2c7f25f1-85f5-49ca-96ef-5f4325f18de5.png',
    "points": 1000,
    "gif": "https://i.postimg.cc/Qx5XDFhz/Untitled-kopia-2.gif",
    "type": "goal_based",
    "goalIds": ["4"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "21",
    "title": "Сила отжиманий",
    "requirement": "• Взять себе цель «Сделать 20 отжиманий»\n• Выполнить эту цель 120 раз\n",
    "status": "my",
    "image": "https://i.postimg.cc/5NQhzTrW/image-(2)-kopia-2.jpg",
    "points": 1000,
    "type": "goal_based",
    "gif": "https://i.postimg.cc/x8cWt41D/5.gif",
    "goalIds": ["8"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "22",
    "title": "Книжный марафон",
    "gif": "https://i.postimg.cc/bwD1pHdm/Untitled-(2).gif",
    "requirement": "• Взять себе цель «Читать книгу 20 мин»\n• Выполнить эту цель 120 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/KjGn26gL/image-(4).jpg',
    "points": 1000,
    "type": "goal_based",
    "goalIds": ["2"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "23",
    "gif": "https://i.postimg.cc/YqjWzfN7/Untitled-(1)-kopia-2.gif",
    "title": "Здоровый рацион",
    "requirement": "• Взять себе цель «День без сладкого»\n• Выполнить эту цель 120 раз\n",
    "status": "locked",
    "image": 'https://i.postimg.cc/hjrdp23D/image-(5).jpg',
    "points": 1000,
    "type": "goal_based",
    "goalIds": ["68"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "24",
    "gif": "https://i.postimg.cc/FRDYj777/Untitled-(1)24324.gif",
    "title": "Ранний старт",
    "requirement": "• Взять себе цель «Рано проснуться»\n• Выполнить эту цель 120 раз\n",
    "status": "locked",
    "image": "https://i.postimg.cc/zGgH9zcV/image-(2)-kopia.jpg",
    "points": 1000,
    "type": "goal_based",
    "goalIds": ["36"],
    "rarity": "legendary",
    "target": 120
  },
  {
    "id": "25",
    "title": "Великий дисциплинатор",
    "requirement": "• Пользоваться ботом и приложением \n на протяжении 365 дней\n",
    "status": "locked",
    "image": "https://i.postimg.cc/KcfnTdvK/image-(1)-kopia-4.jpg",
    "points": 1500,
    "gif": "https://i.postimg.cc/NftZJrdY/Untitled-kopia-12.gif",
    "type": "time_based",
    "rarity": "legendary",
    "target": 365
  },
];

// Read the Api.js file
const apiJsPath = path.join(process.cwd(), 'src', 'lib', 'api', 'Api.js');
let apiJsContent = fs.readFileSync(apiJsPath, 'utf8');

// Find the achievements array and replace it
const achievementsStartPattern = /const achievements = \[/;
const achievementsEndPattern = /\];\s*\n\s*try/;

const startIndex = apiJsContent.search(achievementsStartPattern);
if (startIndex === -1) {
  console.error('Could not find achievements array start');
  process.exit(1);
}

// Find the end of the achievements array
let bracketCount = 1;
let endIndex = startIndex + apiJsContent.substring(startIndex).indexOf('[') + 1;
let i = endIndex;

while (bracketCount > 0 && i < apiJsContent.length) {
  if (apiJsContent[i] === '[') bracketCount++;
  if (apiJsContent[i] === ']') bracketCount--;
  i++;
}

if (bracketCount !== 0) {
  console.error('Could not find achievements array end');
  process.exit(1);
}

endIndex = i;

// Replace the achievements array
const newAchievementsString = 'const achievements = ' + JSON.stringify(newAchievements, null, 2) + ';';
const beforeArray = apiJsContent.substring(0, startIndex);
const afterArray = apiJsContent.substring(endIndex);

const newApiJsContent = beforeArray + newAchievementsString + afterArray;

// Write the updated file
fs.writeFileSync(apiJsPath, newApiJsContent);
console.log('Successfully updated achievements array in Api.js');
