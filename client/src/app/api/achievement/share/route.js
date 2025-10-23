import { ImageResponse } from "@vercel/og";

export const runtime = "edge"; // Важно для работы на Vercel Edge Functions

export async function POST(request) {
  try {
    const { title, description, points = 0, username = "user" } = await request.json();

    const quotes = [
      "«Ты не обязан быть лучшим — просто будь лучше, чем вчера 💫»",
      "«Маленькие шаги каждый день ведут к большим результатам 🌱»",
      "«Дисциплина сильнее мотивации ⚡️»",
      "«Начни сейчас. Идеального момента не будет ⏳»",
      "«Пусть каждый день будет на 1% лучше, чем вчера 🚀»",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "#0b0b0b",
            width: "1200px",
            height: "630px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* username */}
          <div style={{ color: "#00ff99", fontSize: 48 }}>
            @{username}
          </div>

          {/* title */}
          <div style={{ fontSize: 90, fontWeight: "bold", marginTop: 20 }}>
            {title}
          </div>

          {/* description */}
          <div
            style={{
              fontSize: 36,
              color: "#fff",
              opacity: 0.9,
              marginTop: 30,
              maxWidth: "90%",
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>

          {/* points */}
          <div
            style={{
              color: "#00ff99",
              fontSize: 44,
              fontWeight: "bold",
              marginTop: 60,
            }}
          >
            +{points} очков
          </div>

          {/* random quote */}
          <div
            style={{
              fontSize: 30,
              fontStyle: "italic",
              color: "#9b9b9b",
              marginTop: 60,
              maxWidth: "90%",
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
  } catch (error) {
    console.error("Ошибка генерации:", error);
    return new Response("Ошибка генерации изображения", { status: 500 });
  }
}
