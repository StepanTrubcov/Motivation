const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the client/.next directory
app.use(express.static(path.join(__dirname, '.next')));

// Handle all routes by serving the Next.js app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});