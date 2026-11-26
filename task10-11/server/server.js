const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/categories', (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Поля name и type обязательны' });
    }
    const insert = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
    const result = insert.run(name, type);
    res.status(201).json({ id: result.lastInsertRowid, name, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/transactions', (req, res) => {
  try {
    const { category_id, type, from, to } = req.query;
    let sql = `
      SELECT transactions.*, categories.name as category_name, categories.type as category_type
      FROM transactions
      JOIN categories ON transactions.category_id = categories.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ' AND transactions.category_id = ?';
      params.push(category_id);
    }
    if (type) {
      sql += ' AND categories.type = ?';
      params.push(type);
    }
    if (from) {
      sql += ' AND transactions.date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND transactions.date <= ?';
      params.push(to);
    }

    const transactions = db.prepare(sql).all(...params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transactions', (req, res) => {
  try {
    const { amount, currency, category_id, date, comment } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть числом больше 0' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Категория с таким ID не существует' });
    }

    const insert = db.prepare('INSERT INTO transactions (amount, currency, category_id, date, comment) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(amount, currency || 'BYN', category_id, date, comment || null);

    res.status(201).json({ id: result.lastInsertRowid, amount, currency, category_id, date, comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/profile', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users LIMIT 1').get();
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});