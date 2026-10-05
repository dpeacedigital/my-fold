const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data stored on the server
let messages = [
  { user: 'System', text: 'Welcome to the live vibe room!' }
];

let poll = {
  question: 'What should we vibe code next?',
  options: [
    { text: 'AI Image Generator', votes: 0 },
    { text: 'Crypto Price Dashboard', votes: 0 },
    { text: 'Multiplayer Mini-Game', votes: 0 }
  ]
};

// API Endpoints
app.get('/api/data', (req, res) => {
  res.json({ messages, poll });
});

app.post('/api/message', (req, res) => {
  const { user, text } = req.body;
  if (user && text) {
    messages.push({ user: user.trim(), text: text.trim() });
    if (messages.length > 30) messages.shift(); // keep last 30 messages
  }
  res.json({ success: true });
});

app.post('/api/vote', (req, res) => {
  const { index } = req.body;
  if (poll.options[index]) {
    poll.options[index].votes += 1;
  }
  res.json({ success: true });
});

// Front-end UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vibe Room & Poll</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0b0f19;
            color: #f1f5f9;
            margin: 0;
            padding: 20px 16px;
            display: flex;
            justify-content: center;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            width: 100%;
            max-width: 800px;
          }
          @media (min-width: 768px) {
            .grid { grid-template-columns: 1fr 1fr; }
          }
          .card {
            background-color: #151d30;
            border: 1px solid #1e293b;
            border-radius: 14px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          h2 { margin: 0 0 16px 0; font-size: 1.25rem; color: #38bdf8; }
          .chat-box {
            background: #0b0f19;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 12px;
            height: 260px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
          }
          .chat-msg { font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
          .chat-user { font-weight: bold; color: #38bdf8; margin-right: 6px; }
          .chat-inputs { display: flex; flex-direction: column; gap: 8px; }
          input, button {
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #334155;
            background: #0b0f19;
            color: white;
            font-size: 0.9rem;
            outline: none;
          }
          button {
            background: #0284c7;
            border: none;
            font-weight: 600;
            cursor: pointer;
          }
          button:hover { background: #0369a1; }
          .poll-option {
            background: #0b0f19;
            border: 1px solid #1e293b;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            user-select: none;
          }
          .poll-bar {
            position: absolute;
            top: 0; left: 0; bottom: 0;
            background: rgba(56, 189, 248, 0.15);
            transition: width 0.3s ease;
          }
          .poll-content {
            position: relative;
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="grid">
          <!-- Live Room Chat -->
          <div class="card">
            <h2>💬 Live Room Chat</h2>
            <div class="chat-box" id="chatBox"></div>
            <div class="chat-inputs">
              <input type="text" id="userInput" placeholder="Your name (e.g. Alex)" />
              <div style="display:flex; gap: 8px;">
                <input type="text" id="msgInput" placeholder="Type a message..." style="flex:1;" />
                <button onclick="sendMessage()">Send</button>
              </div>
            </div>
          </div>

          <!-- Community Poll -->
          <div class="card">
            <h2>📊 Community Poll</h2>
            <p id="pollQuestion" style="color: #94a3b8; font-size: 0.95rem; margin-top: 0;"></p>
            <div id="pollOptions"></div>
            <p style="font-size: 0.8rem; color: #64748b; text-align: center; margin-top: auto;">
              Click an option to cast your vote!
            </p>
          </div>
        </div>

        <script>
          async function fetchData() {
            try {
              const res = await fetch('/api/data');
              const data = await res.json();
              renderChat(data.messages);
              renderPoll(data.poll);
            } catch (err) {
              console.error(err);
            }
          }

          function renderChat(messages) {
            const chatBox = document.getElementById('chatBox');
            chatBox.innerHTML = messages.map(m => \`
              <div class="chat-msg">
                <span class="chat-user">\${m.user}:</span>\${m.text}
              </div>
            \`).join('');
          }

          function renderPoll(poll) {
            document.getElementById('pollQuestion').textContent = poll.question;
            const container = document.getElementById('pollOptions');
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

            container.innerHTML = poll.options.map((opt, idx) => {
              const pct = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
              return \`
                <div class="poll-option" onclick="vote(\${idx})">
                  <div class="poll-bar" style="width: \${pct}%"></div>
                  <div class="poll-content">
                    <span>\${opt.text}</span>
                    <span>\${opt.votes} (\${pct}%)</span>
                  </div>
                </div>
              \`;
            }).join('');
          }

          async function sendMessage() {
            const user = document.getElementById('userInput').value || 'Anonymous';
            const msgInput = document.getElementById('msgInput');
            const text = msgInput.value.trim();
            if (!text) return;

            await fetch('/api/message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user, text })
            });

            msgInput.value = '';
            fetchData();
          }

          async function vote(index) {
            await fetch('/api/vote', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index })
            });
            fetchData();
          }

          document.getElementById('msgInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
          });

          // Fetch fresh data immediately and poll every 2 seconds
          fetchData();
          setInterval(fetchData, 2000);
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});