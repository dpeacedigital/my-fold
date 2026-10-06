const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory transfer feed
let drops = [
  {
    id: 1,
    type: 'text',
    content: 'Welcome to VibeDrop! Send any note or photo between your phone and PC.',
    sender: 'System',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

// Fetch all drops
app.get('/api/drops', (req, res) => {
  res.json({ drops });
});

// Post a new drop (text or image)
app.post('/api/drops', (req, res) => {
  const { type, content, sender, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const newDrop = {
    id: Date.now(),
    type: type || 'text',
    content,
    filename: filename || null,
    sender: sender || 'Anonymous',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  drops.unshift(newDrop);
  if (drops.length > 25) drops.pop(); // Keep latest 25 items

  res.json({ success: true, drop: newDrop });
});

// Clear drops
app.post('/api/clear', (req, res) => {
  drops = [];
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VibeDrop listening on port ${PORT}`);
});