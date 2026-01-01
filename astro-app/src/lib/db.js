// src/lib/db.js
// Подключение к SQLite базе данных

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к текущему файлу (для работы с ES модулями)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу базы данных
// В production: database/shop.db
// Относительно src/lib/ это будет: ../../database/shop.db
const dbPath = path.join(__dirname, '../../database/shop.db');

// Создаем подключение к базе данных
// Если файл не существует, SQLite создаст его автоматически
const db = new Database(dbPath);

// Включаем foreign keys (внешние ключи) для SQLite
// Это позволяет использовать FOREIGN KEY ограничения
db.pragma('foreign_keys = ON');

// Экспортируем подключение для использования в других файлах
export default db;

