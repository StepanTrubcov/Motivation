import { NextResponse } from 'next/server';
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { title, description, points, username } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Не хватает данных' }, { status: 400 });
    }

    // Генерируем изображение с помощью @vercel/og
    const imageResponse = await generateAchievementImage({
      title,
      description, 
      points: points || 0,
      username: username || 'user'
    });

    // Конвертируем в base64
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });

  } catch (error) {
    console.error('❌ Ошибка генерации share-картинки:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка генерации изображения',
      url: null,
    }, { status: 500 });
  }
}

async function generateAchievementImage({ title, description, points, username }) {
  const quotes = [
    '«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»',
    '«Маленькие шаги каждый день ведут к большим результатам 🌱»',
    '«Дисциплина сильнее мотивации ⚡️»',
    '«Начни сейчас. Идеального момента не будет ⏳»',
    '«Пусть каждый день будет на 1% лучше, чем вчера 🚀»',
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          backgroundColor: '#0b0b0b',
          padding: 80,
          paddingTop: 100,
          fontFamily: 'Arial',
          position: 'relative',
        }}
      >
        {/* Username */}
        <div
          style={{
            color: '#00ff99',
            fontSize: 48,
            fontWeight: 'bold',
            marginBottom: 40,
          }}
        >
          @{username}
        </div>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 40,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 34,
            lineHeight: 1.4,
            marginBottom: 40,
            maxWidth: 1000,
          }}
        >
          {description}
        </div>

        {/* Points */}
        <div
          style={{
            color: '#00ff99',
            fontSize: 40,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 60,
          }}
        >
          +{points} очков
        </div>

        {/* Quote */}
        <div
          style={{
            color: '#9b9b9b',
            fontSize: 30,
            fontStyle: 'italic',
            position: 'absolute',
            bottom: 60,
            left: 80,
            maxWidth: 1000,
          }}
        >
          {randomQuote}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}