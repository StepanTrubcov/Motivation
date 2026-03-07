#!/usr/bin/env node

// Script to simplify the generate-report API endpoint
import fs from 'fs';
import path from 'path';

// Read the generate-report route file
const routePath = path.join(process.cwd(), 'src', 'app', 'api', 'generate-report', '[telegramId]', 'route.js');
let routeContent = fs.readFileSync(routePath, 'utf8');

// Define the old code block to remove
const oldCodeBlock = `    const user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    let prevReports = Array.isArray(user.yesterdayReport) ? user.yesterdayReport : [];
    let yesterdayReport = null;

    if (prevReports.length === 2) {
      const prevSecond = prevReports[1];
      const prevSecondDate = new Date(prevSecond.date).toDateString();
      if (prevSecondDate !== todayString) {
        yesterdayReport = prevSecond;
      } else {
        yesterdayReport = prevReports[0] || null;
      }
    } else if (prevReports.length === 1) {
      const prevDate = new Date(prevReports[0].date).toDateString();
      if (prevDate !== todayString) yesterdayReport = prevReports[0];
    }

    const todayReport = { text: finalMessage, date: today.toISOString() };
    const reports = [yesterdayReport, todayReport];

    await prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { yesterdayReport: reports },
    });

    return NextResponse.json({ message: finalMessage, success: true, savedReports: reports });`;

// Define the new simplified code
const newCodeBlock = `    // Return today's report without saving to database
    return NextResponse.json({ 
      message: finalMessage, 
      success: true, 
      report: { text: finalMessage, date: today.toISOString() }
    });`;

// Replace the old code with new code
const updatedRouteContent = routeContent.replace(oldCodeBlock, newCodeBlock);

// Write the updated file
fs.writeFileSync(routePath, updatedRouteContent);
console.log('Successfully simplified generate-report API endpoint');
