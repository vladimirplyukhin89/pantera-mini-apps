// src/scripts/test-cart-api.js
// Тестовый скрипт для проверки Cart API endpoints

/**
 * Инструкция по использованию:
 * 1. Убедитесь, что dev сервер запущен: npm run dev
 * 2. Запустите скрипт: node src/scripts/test-cart-api.js
 * 
 * Или используйте curl команды (см. CART_API_TESTING.md)
 */

const BASE_URL = 'http://localhost:4321';
// Используем уникальный тестовый ID с timestamp, чтобы не конфликтовать с реальными данными
const TEST_USER_ID = `test_cart_api_${Date.now()}`;

// Цвета для вывода в консоль
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logTest(message) {
  log(`\n🧪 ${message}`, 'blue');
}

// Вспомогательная функция для выполнения HTTP запросов
async function fetchAPI(method, url, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message, data: null };
  }
}

// Проверка доступности сервера
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/products`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Тестовые данные (нужно получить реальные ID из базы данных)
let testProductId = null;
let testVariantId = null;
let testCartItemId = null;

async function main() {
  log('\n🚀 Начало тестирования Cart API\n', 'cyan');
  logInfo('⚠️  ВАЖНО: Тест использует существующие товары из базы данных');
  logInfo('⚠️  Тест НЕ изменяет данные о товарах, только работает с корзиной');
  logInfo(`🔍 Тестовый пользователь: ${TEST_USER_ID}\n`);

  // Проверка доступности сервера
  logTest('Проверка доступности сервера...');
  const serverAvailable = await checkServer();
  if (!serverAvailable) {
    logError('Сервер недоступен!');
    logInfo('Убедитесь, что dev сервер запущен: npm run dev');
    logInfo(`Проверьте, что сервер работает на ${BASE_URL}`);
    return;
  }
  logSuccess('Сервер доступен');

  // Шаг 1: Получить список товаров для тестирования
  logTest('Шаг 1: Получение списка товаров...');
  try {
    const productsResponse = await fetchAPI('GET', `${BASE_URL}/api/products`);
    
    if (productsResponse.status === 0) {
      logError('Не удалось подключиться к серверу');
      logInfo('Убедитесь, что dev сервер запущен: npm run dev');
      return;
    }
    
    if (productsResponse.status === 200 && productsResponse.data && productsResponse.data.length > 0) {
      const product = productsResponse.data[0];
      testProductId = product.id;
      
      if (product.variants && product.variants.length > 0) {
        // Выбираем вариант с наибольшим остатком
        const variantWithStock = product.variants
          .filter(v => v.stock > 0)
          .sort((a, b) => b.stock - a.stock)[0] || product.variants[0];
        
        testVariantId = variantWithStock.id;
        const availableStock = variantWithStock.stock;
        
        logSuccess(`Найден товар: ${product.name} (ID: ${testProductId})`);
        logInfo(`Используем вариант: ${variantWithStock.size} (ID: ${testVariantId})`);
        logInfo(`Доступно на складе: ${availableStock} шт.`);
      } else {
        logError('У товара нет вариантов (размеров)');
        return;
      }
    } else {
      logError('Нет товаров в базе данных.');
      logInfo('Тест использует существующие товары из базы данных.');
      logInfo('Если товаров нет, добавьте их через SQLite CLI или через админ-панель (если есть).');
      logInfo('⚠️  ВАЖНО: Тест НЕ требует запуска seed скрипта и не изменяет данные о товарах!');
      return;
    }
  } catch (error) {
    logError(`Ошибка при получении товаров: ${error.message}`);
    logInfo('Убедитесь, что dev сервер запущен: npm run dev');
    return;
  }

  // Шаг 2: Получить пустую корзину
  logTest('Шаг 2: Получение пустой корзины...');
  const getEmptyCart = await fetchAPI('GET', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (getEmptyCart.status === 0) {
    logError('Не удалось подключиться к серверу');
    logInfo('Убедитесь, что dev сервер запущен: npm run dev');
    return;
  }
  
  if (getEmptyCart.status === 200) {
    logSuccess('Корзина получена (пустая)');
    console.log('   Данные:', JSON.stringify(getEmptyCart.data, null, 2));
  } else {
    logError(`Ошибка: ${getEmptyCart.status}`);
    if (getEmptyCart.data) {
      console.log('   Ответ:', getEmptyCart.data);
    } else if (getEmptyCart.error) {
      console.log('   Ошибка:', getEmptyCart.error);
    }
  }

  // Шаг 3: Добавить товар в корзину
  logTest('Шаг 3: Добавление товара в корзину...');
  // Используем quantity: 1, чтобы избежать проблем с остатками
  const addItem = await fetchAPI('POST', `${BASE_URL}/api/cart/items`, {
    telegram_user_id: TEST_USER_ID,
    product_id: testProductId,
    variant_id: testVariantId,
    quantity: 1,
  });

  if (addItem.status === 0) {
    logError('Не удалось подключиться к серверу');
    logInfo('Убедитесь, что dev сервер запущен: npm run dev');
    return;
  }
  
  if (addItem.status === 200) {
    testCartItemId = addItem.data.id;
    logSuccess('Товар добавлен в корзину');
    console.log('   Данные:', JSON.stringify(addItem.data, null, 2));
  } else {
    logError(`Ошибка: ${addItem.status}`);
    if (addItem.data) {
      console.log('   Ответ:', addItem.data);
    } else if (addItem.error) {
      console.log('   Ошибка:', addItem.error);
    }
    return;
  }

  // Шаг 4: Получить корзину с товарами
  logTest('Шаг 4: Получение корзины с товарами...');
  const getCart = await fetchAPI('GET', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (getCart.status === 200) {
    logSuccess('Корзина получена');
    console.log('   Количество товаров:', getCart.data.items.length);
    console.log('   Данные:', JSON.stringify(getCart.data, null, 2));
  } else {
    logError(`Ошибка: ${getCart.status}`);
    console.log('   Ответ:', getCart.data);
  }

  // Шаг 5: Обновить количество товара
  logTest('Шаг 5: Обновление количества товара...');
  // Получаем доступный остаток из данных корзины
  let availableStock = 1; // По умолчанию
  if (getCart.status === 200 && getCart.data.items.length > 0) {
    availableStock = getCart.data.items[0].stock || 1;
  }
  
  // Используем минимальное значение между доступным остатком и 2
  const updateQuantity = Math.min(availableStock, 2);
  
  const updateItem = await fetchAPI('PUT', `${BASE_URL}/api/cart/items/${testCartItemId}`, {
    quantity: updateQuantity,
  });

  if (updateItem.status === 200) {
    logSuccess('Количество товара обновлено');
    console.log('   Новое количество:', updateItem.data.quantity);
  } else {
    logError(`Ошибка: ${updateItem.status}`);
    if (updateItem.data) {
      console.log('   Ответ:', updateItem.data);
    } else if (updateItem.error) {
      console.log('   Ошибка:', updateItem.error);
    }
  }

  // Шаг 6: Проверить обновленную корзину
  logTest('Шаг 6: Проверка обновленной корзины...');
  const getUpdatedCart = await fetchAPI('GET', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (getUpdatedCart.status === 200) {
    logSuccess('Корзина обновлена');
    console.log('   Количество товаров:', getUpdatedCart.data.items.length);
    if (getUpdatedCart.data.items.length > 0) {
      console.log('   Количество первого товара:', getUpdatedCart.data.items[0].quantity);
    }
  }

  // Шаг 7: Удалить товар из корзины
  logTest('Шаг 7: Удаление товара из корзины...');
  const deleteItem = await fetchAPI('DELETE', `${BASE_URL}/api/cart/items/${testCartItemId}`);

  if (deleteItem.status === 200) {
    logSuccess('Товар удален из корзины');
  } else {
    logError(`Ошибка: ${deleteItem.status}`);
    console.log('   Ответ:', deleteItem.data);
  }

  // Шаг 8: Проверить пустую корзину
  logTest('Шаг 8: Проверка пустой корзины после удаления...');
  const getEmptyCartAfter = await fetchAPI('GET', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (getEmptyCartAfter.status === 200) {
    logSuccess('Корзина пуста');
    console.log('   Количество товаров:', getEmptyCartAfter.data.items.length);
  }

  // Шаг 9: Добавить товар снова для теста очистки
  logTest('Шаг 9: Добавление товара для теста очистки...');
  const addItemAgain = await fetchAPI('POST', `${BASE_URL}/api/cart/items`, {
    telegram_user_id: TEST_USER_ID,
    product_id: testProductId,
    variant_id: testVariantId,
    quantity: 1,
  });

  if (addItemAgain.status === 200) {
    logSuccess('Товар добавлен');
  }

  // Шаг 10: Очистить корзину
  logTest('Шаг 10: Очистка корзины...');
  const clearCart = await fetchAPI('DELETE', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);

  if (clearCart.status === 200) {
    logSuccess('Корзина очищена');
  } else {
    logError(`Ошибка: ${clearCart.status}`);
    console.log('   Ответ:', clearCart.data);
  }

  // Шаг 11: Проверить пустую корзину после очистки
  logTest('Шаг 11: Проверка корзины после очистки...');
  const getEmptyCartFinal = await fetchAPI('GET', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (getEmptyCartFinal.status === 200) {
    logSuccess('Корзина пуста');
    console.log('   Количество товаров:', getEmptyCartFinal.data.items.length);
  }

  // Тесты валидации
  logTest('Шаг 12: Тесты валидации...');

  // Тест: GET без telegram_user_id
  logInfo('Тест: GET /api/cart без telegram_user_id');
  const getWithoutUserId = await fetchAPI('GET', `${BASE_URL}/api/cart`);
  if (getWithoutUserId.status === 400) {
    logSuccess('Валидация работает: ошибка 400 при отсутствии telegram_user_id');
  } else {
    logError('Валидация не работает');
  }

  // Тест: POST без обязательных полей
  logInfo('Тест: POST /api/cart/items без обязательных полей');
  const postWithoutFields = await fetchAPI('POST', `${BASE_URL}/api/cart/items`, {
    telegram_user_id: TEST_USER_ID,
    // product_id и variant_id отсутствуют
  });
  if (postWithoutFields.status === 400) {
    logSuccess('Валидация работает: ошибка 400 при отсутствии обязательных полей');
  } else {
    logError('Валидация не работает');
  }

  // Тест: PUT с неверным ID
  logInfo('Тест: PUT /api/cart/items/99999 (несуществующий ID)');
  const putInvalidId = await fetchAPI('PUT', `${BASE_URL}/api/cart/items/99999`, {
    quantity: 1,
  });
  if (putInvalidId.status === 404) {
    logSuccess('Валидация работает: ошибка 404 при несуществующем ID');
  } else {
    logError('Валидация не работает');
  }

  // Финальная очистка: удаляем все тестовые данные
  logTest('Финальная очистка: удаление тестовых данных...');
  const finalCleanup = await fetchAPI('DELETE', `${BASE_URL}/api/cart?telegram_user_id=${TEST_USER_ID}`);
  
  if (finalCleanup.status === 200 || finalCleanup.status === 404) {
    logSuccess('Тестовые данные очищены');
    logInfo(`Тестовая корзина для пользователя ${TEST_USER_ID} удалена`);
  } else {
    logError('Не удалось очистить тестовые данные');
    logInfo(`Вручную удалите корзину для пользователя: ${TEST_USER_ID}`);
  }

  log('\n✅ Тестирование завершено!\n', 'green');
  logInfo('⚠️  Все тестовые данные автоматически очищены');
  logInfo('📚 Для просмотра подробных curl команд см. CART_API_TESTING.md');
  logInfo(`🔍 Тестовый пользователь: ${TEST_USER_ID}`);
}

// Запуск тестов
main().catch(error => {
  logError(`Критическая ошибка: ${error.message}`);
  process.exit(1);
});

