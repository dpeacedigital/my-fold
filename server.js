const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Server-side drawing state & messages
let drawingLines = [];
let roomChat = [
  { sender: 'System', text: 'Whiteboard ready. Draw or type a guess below!' }
];

app.get('/api/board', (req, res) => {
  res.json({ lines: drawingLines, chat: roomChat });
});

app.post('/api/draw', (req, res) => {
  const { line } = req.body;
  if (line) {
    drawingLines.push(line);
    if (drawingLines.length > 800) drawingLines.shift();
  }
  res.json({ success: true });
});

app.post('/api/clear', (req, res) => {
  drawingLines = [];
  roomChat.push({ sender: 'System', text: 'Canvas was cleared!' });
  res.json({ success: true });
});

app.post('/api/chat', (req, res) => {
  const { sender, text } = req.body;
  if (text) {
    roomChat.push({
      sender: sender || 'Artist',
      text: text.trim()
    });
    if (roomChat.length > 20) roomChat.shift();
  }
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VibeDraw listening on port ${PORT}`);
});