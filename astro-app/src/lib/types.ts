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

