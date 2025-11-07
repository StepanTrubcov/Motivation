const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const scheduleTasks = require('./src/utils/scheduled-tasks');

const prisma = new PrismaClient();

const app = express();

app.use(express.static(path.join(__dirname, '.next')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  scheduleTasks();
  
});