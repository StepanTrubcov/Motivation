#!/usr/bin/env node

// Script to backup database before removing completedDates field
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function backupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting database backup...');
    
    // Get all users with their completedDates
    const users = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        username: true,
        completedDates: true,
        pts: true,
        savingGoals: true,
        usersTag: true,
        registrationDate: true
      }
    });
    
    // Save to backup file
    const backupData = {
      timestamp: new Date().toISOString(),
      users: users
    };
    
    const backupFilePath = path.join(process.cwd(), 'scripts', 'backups', `completed-dates-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    
    // Ensure backups directory exists
    const backupDir = path.dirname(backupFilePath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    console.log(`Database backed up to: ${backupFilePath}`);
    console.log(`Found ${users.length} users with completedDates data`);
    
    // Count users who actually have completedDates
    const usersWithCompletedDates = users.filter(user => user.completedDates && user.completedDates.length > 0);
    console.log(`${usersWithCompletedDates.length} users have actual completedDates data`);
    
    return backupFilePath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase().catch(console.error);
}

export { backupDatabase };
