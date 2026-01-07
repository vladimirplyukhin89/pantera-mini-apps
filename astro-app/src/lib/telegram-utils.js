// src/lib/telegram-utils.js
// Утилиты для работы с Telegram WebApp SDK

/**
 * Получить telegram_user_id из Telegram WebApp SDK
 * @returns {string | null} ID пользователя Telegram или null если не доступен
 */
export function getTelegramUserId() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Проверяем наличие Telegram WebApp SDK
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return String(window.Telegram.WebApp.initDataUnsafe.user.id);
    }

    // Fallback для разработки (можно использовать тестовый ID)
    // В production это не будет использоваться
    if (process.env.NODE_ENV === 'development') {
      // Можно использовать localStorage для тестирования
      const testUserId = localStorage.getItem('test_telegram_user_id');
      if (testUserId) {
        return testUserId;
      }
      
      // Или использовать дефолтный тестовый ID
      return '123456789'; // Для разработки
    }

    return null;
  } catch (error) {
    console.error('Ошибка при получении telegram_user_id:', error);
    return null;
  }
}

/**
 * Установить тестовый telegram_user_id для разработки
 * @param {string} userId - Тестовый ID пользователя
 */
export function setTestTelegramUserId(userId) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('test_telegram_user_id', userId);
  }
}

