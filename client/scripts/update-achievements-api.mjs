#!/usr/bin/env node

// Script to update achievements API to support gif field
import fs from 'fs';
import path from 'path';

// Read the achievements route file
const routePath = path.join(process.cwd(), 'src', 'app', 'api', 'users', '[id]', 'achievements', 'route.js');
let routeContent = fs.readFileSync(routePath, 'utf8');

// Update the prisma.achievement.create call to include gif field
const oldCreateData = `const created = await prisma.achievement.create({
          data: {
            title: ach.title,
            description: ach.description,
            requirement: ach.requirement,
            status: ach.status,
            image: ach.image,
            points: ach.points,
            type: ach.type,
            goalIds: ach.goalIds || [],
            target: ach.target,
            userId
          }
        });`;

const newCreateData = `const created = await prisma.achievement.create({
          data: {
            title: ach.title,
            description: ach.description,
            requirement: ach.requirement,
            status: ach.status,
            image: ach.image,
            gif: ach.gif,
            points: ach.points,
            type: ach.type,
            goalIds: ach.goalIds || [],
            target: ach.target,
            userId
          }
        });`;

// Replace the old create data with new one
const updatedRouteContent = routeContent.replace(oldCreateData, newCreateData);

// Write the updated file
fs.writeFileSync(routePath, updatedRouteContent);
console.log('Successfully updated achievements API to support gif field');
