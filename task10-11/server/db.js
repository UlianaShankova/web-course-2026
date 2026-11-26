const Database = require('better-sqlite3');
const db = new Database('data.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    icon TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'BYN',
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'Студент'
  );
`);

const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;

if (categoriesCount === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, type, icon) VALUES (?, ?, ?)');
  insertCategory.run('Зарплата', 'income', '💼');
  insertCategory.run('Фриланс', 'income', '💻');
  insertCategory.run('Еда', 'expense', '🍔');
  insertCategory.run('Шоппинг', 'expense', '🛍️');
  insertCategory.run('Развлечения', 'expense', '🎬');
  insertCategory.run('Ювелирка', 'expense', '💍');
  insertCategory.run('Книжный', 'expense', '📚');
  insertCategory.run('Транспорт', 'expense', '🚗');
}

const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (usersCount === 0) {
  db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)').run('Ульяна Шанькова', 'uliana.shankova12@gmail.com', 'Pro-аккаунт');
}

module.exports = db;