// src/lib/types.ts
// TypeScript типы для данных приложения

/**
 * Вариант товара (размер с ценой и остатком)
 */
export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  stock: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Товар из базы данных (без вариантов)
 */
export interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  collection_name: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

/**
 * Товар с вариантами (полная информация)
 */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  collection_name: string | null;
  active: number;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
}

/**
 * Корзина из базы данных
 */
export interface CartRow {
  id: number;
  telegram_user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Элемент корзины из базы данных (без информации о товаре)
 */
export interface CartItemRow {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number;
  size: string;
  quantity: number;
  created_at: string;
}

/**
 * Элемент корзины с информацией о товаре (для API)
 */
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number;
  size: string;
  quantity: number;
  created_at: string;
  product_name: string;
  product_image_url: string | null;
  price: number;
  stock: number;
}

/**
 * Корзина с элементами (полная информация)
 */
export interface Cart {
  id: number;
  telegram_user_id: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

