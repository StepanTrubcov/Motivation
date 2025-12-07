import { NextResponse } from 'next/server';
import { createCanvas } from '@napi-rs/canvas';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Достижение';
    const description = searchParams.get('description') || 'Описание достижения';
    const points = searchParams.get('points') || '0';
    const username = searchParams.get('username') || 'user';

    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, width, height);

    // Используем только базовые шрифты без регистрации
    ctx.fillStyle = '#00ff99';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`@${username}`, 80, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px sans-serif';

    // Ограничиваем длину заголовка
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    ctx.fillText(shortTitle, 80, 200);

    // Описание с ограничением
    ctx.font = '34px sans-serif';
    ctx.fillStyle = '#ffffff';
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

    // Простой перенос строк
    const lines = [];
    let currentLine = '';
    const words = shortDesc.split(' ');

    for (const word of words) {
      const testLine = currentLine + word + ' ';
      if (testLine.length > 40) { // Примерное ограничение по символам
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Рисуем линии описания
    let y = 270;
    for (const line of lines.slice(0, 3)) { // Максимум 3 строки
      ctx.fillText(line.trim(), 80, y);
      y += 45;
    }

    // Очки
    ctx.fillStyle = '#00ff99';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`+${points} очков`, 80, y + 30);

    // Цитата
    const quotes = [
      '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
      '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
      '«Дисциплина сильнее мотивации ⚡️»',
      '«Начни сейчас. Идеального момента не будет ⏳»',
      '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    ctx.font = 'italic 30px sans-serif';
    ctx.fillStyle = '#9b9b9b';

    // Обрезаем длинную цитату
    const shortQuote = randomQuote.length > 60 ? randomQuote.substring(0, 60) + '...' : randomQuote;
    ctx.fillText(shortQuote, 80, height - 60);

    // Возвращаем изображение как PNG
    const buffer = canvas.toBuffer('image/png');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('❌ Ошибка генерации изображения:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}