// src/lib/logger.js
// Простой logger для логирования событий и ошибок в приложении

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к корню проекта
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Путь к папке с логами
const logsDir = path.join(projectRoot, 'logs');

// Создаем папку logs, если её нет
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Получить имя файла лога для текущей даты
 * @param {string} level - Уровень логирования
 * @returns {string} Путь к файлу лога
 */
function getLogFilePath(level) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${today}-${level}.log`;
  return path.join(logsDir, filename);
}

/**
 * Записать лог в файл
 * @param {string} level - Уровень логирования
 * @param {object} logEntry - Объект лога
 */
function writeToFile(level, logEntry) {
  try {
    const logFile = getLogFilePath(level);
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    // Если не удалось записать в файл, выводим в консоль
    console.error('Ошибка при записи лога в файл:', error);
  }
}

/**
 * Форматирует лог с временной меткой и контекстом
 * @param {string} level - Уровень логирования (error, warn, info, debug)
 * @param {string} message - Сообщение для логирования
 * @param {object} context - Дополнительный контекст (опционально)
 * @returns {object} Структурированный объект лога
 */
function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context
  };

  // Форматируем вывод в консоль
  const levelEmoji = {
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    debug: '🔍'
  };

  const emoji = levelEmoji[level] || '📝';
  const levelUpper = level.toUpperCase().padEnd(5);
  const prefix = `${emoji} [${levelUpper}] ${timestamp}`;

  // Выводим в консоль в зависимости от уровня
  if (level === 'error') {
    console.error(`${prefix} - ${message}`, Object.keys(context).length > 0 ? context : '');
  } else if (level === 'warn') {
    console.warn(`${prefix} - ${message}`, Object.keys(context).length > 0 ? context : '');
  } else {
    console.log(`${prefix} - ${message}`, Object.keys(context).length > 0 ? context : '');
  }

  // Записываем в файл
  // Все логи пишем в combined.log, ошибки также в error.log
  writeToFile('combined', logEntry);
  if (level === 'error') {
    writeToFile('error', logEntry);
  }

  return logEntry;
}

/**
 * Logger для приложения
 * 
 * Использование:
 * ```javascript
 * import { logger } from '@/lib/logger.js';
 * 
 * logger.error('Ошибка при добавлении товара', { product_id: 1, error: e.message });
 * logger.info('Товар добавлен в корзину', { cart_item_id: 123 });
 * logger.warn('Недостаточно товара на складе', { product_id: 1, available: 5 });
 * ```
 */
export const logger = {
  /**
   * Логирование ошибок
   * @param {string} message - Сообщение об ошибке
   * @param {object} context - Контекст ошибки (endpoint, user_id, error, stack и т.д.)
   */
  error: (message, context = {}) => {
    return formatLog('error', message, context);
  },

  /**
   * Логирование предупреждений
   * @param {string} message - Сообщение-предупреждение
   * @param {object} context - Контекст предупреждения
   */
  warn: (message, context = {}) => {
    return formatLog('warn', message, context);
  },

  /**
   * Логирование информационных сообщений
   * @param {string} message - Информационное сообщение
   * @param {object} context - Контекст события
   */
  info: (message, context = {}) => {
    return formatLog('info', message, context);
  },

  /**
   * Логирование отладочной информации
   * @param {string} message - Отладочное сообщение
   * @param {object} context - Контекст для отладки
   */
  debug: (message, context = {}) => {
    // В production можно отключить debug логи
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      return formatLog('debug', message, context);
    }
  },
};

