const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VibeWallet - Expense Tracker</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0b0f19;
            color: #f1f5f9;
            margin: 0;
            padding: 24px 16px;
            display: flex;
            justify-content: center;
          }
          .app-card {
            background-color: #151d30;
            border: 1px solid #1e293b;
            border-radius: 16px;
            width: 100%;
            max-width: 480px;
            padding: 24px;
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
          }
          h1 {
            margin: 0 0 16px 0;
            color: #38bdf8;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .summary-box {
            background: linear-gradient(135deg, #0284c7, #2563eb);
            padding: 18px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
          }
          .summary-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.85;
          }
          .summary-amount {
            font-size: 2.2rem;
            font-weight: 800;
            margin-top: 4px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 24px;
          }
          input, select, button {
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #334155;
            background: #0b0f19;
            color: white;
            font-size: 0.95rem;
            outline: none;
          }
          input:focus, select:focus {
            border-color: #38bdf8;
          }
          button.add-btn {
            background-color: #38bdf8;
            color: #0b0f19;
            font-weight: 700;
            border: none;
            cursor: pointer;
          }
          button.add-btn:hover {
            background-color: #0284c7;
            color: white;
          }
          h2 {
            font-size: 1.1rem;
            margin: 0 0 12px 0;
            color: #94a3b8;
          }
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          li {
            background-color: #0b0f19;
            border: 1px solid #1e293b;
            padding: 12px 14px;
            border-radius: 8px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item-desc {
            font-weight: 500;
          }
          .item-category {
            font-size: 0.75rem;
            color: #64748b;
            display: block;
          }
          .item-amount {
            font-weight: 700;
            color: #f87171;
            margin-right: 12px;
          }
          .del-btn {
            background: #ef4444;
            border: none;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
          }
          .empty-msg {
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            padding: 16px 0;
          }
        </style>
      </head>
      <body>
        <div class="app-card">
          <h1>💳 VibeWallet</h1>

          <div class="summary-box">
            <div class="summary-label">Total Spent</div>
            <div class="summary-amount" id="totalDisplay">$0.00</div>
          </div>

          <div class="form-group">
            <input type="text" id="descInput" placeholder="What did you buy? (e.g. Coffee)" />
            <input type="number" id="amountInput" placeholder="Amount (e.g. 4.50)" step="0.01" />
            <select id="catSelect">
              <option value="Food & Drinks">🍔 Food & Drinks</option>
              <option value="Shopping">🛍️️ Shopping</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Bills">💡 Bills</option>
              <option value="Other">✨ Other</option>
            </select>
            <button class="add-btn" onclick="addExpense()">Add Expense</button>
          </div>

          <h2>Recent Expenses</h2>
          <ul id="expenseList"></ul>
          <div id="emptyMsg" class="empty-msg">No expenses tracked yet.</div>
        </div>

        <script>
          const expenses = [];

          function updateUI() {
            const list = document.getElementById('expenseList');
            const totalDisplay = document.getElementById('totalDisplay');
            const emptyMsg = document.getElementById('emptyMsg');

            list.innerHTML = '';
            let total = 0;

            if (expenses.length === 0) {
              emptyMsg.style.display = 'block';
            } else {
              emptyMsg.style.display = 'none';
              expenses.forEach((item, index) => {
                total += item.amount;
                const li = document.createElement('li');
                li.innerHTML = \`
                  <div>
                    <span class="item-desc">\${item.desc}</span>
                    <span class="item-category">\${item.category}</span>
                  </div>
                  <div>
                    <span class="item-amount">-\$\${item.amount.toFixed(2)}</span>
                    <button class="del-btn" onclick="deleteExpense(\${index})">✕</button>
                  </div>
                \`;
                list.appendChild(li);
              });
            }

            totalDisplay.textContent = '$' + total.toFixed(2);
          }

          function addExpense() {
            const desc = document.getElementById('descInput').value.trim();
            const amount = parseFloat(document.getElementById('amountInput').value);
            const category = document.getElementById('catSelect').value;

            if (!desc || isNaN(amount) || amount <= 0) {
              alert('Please enter a valid item name and amount.');
              return;
            }

            expenses.unshift({ desc, amount, category });
            document.getElementById('descInput').value = '';
            document.getElementById('amountInput').value = '';
            updateUI();
          }

          function deleteExpense(index) {
            expenses.splice(index, 1);
            updateUI();
          }
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});