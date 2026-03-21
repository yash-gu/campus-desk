const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.post('/test', (req, res) => {
  console.log('Test request received:', req.body);
  res.json({ message: 'Test successful', received: req.body });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
