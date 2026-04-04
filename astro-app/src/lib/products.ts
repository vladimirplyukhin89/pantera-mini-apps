import type { Product, ProductVariant } from './types';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  collection_name: string | null;
  images?: { url: string }[];
  variants?: StrapiVariant[];
}

interface StrapiVariant {
  id: number;
  size: string;
  stock: number;
  price: number;
}

function getStrapiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

function mapStrapiProduct(item: StrapiProduct): Product {
  const imageUrls = item.images?.map((img) => {
    return img.url.startsWith('http') ? img.url : `${STRAPI_URL}${img.url}`;
  }) ?? [];

  const variants: ProductVariant[] = item.variants?.map((v) => ({
    id: v.id,
    size: v.size,
    stock: v.stock,
    price: v.price,
  })) ?? [];

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    image_urls: imageUrls,
    collection_name: item.collection_name,
    variants,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/products?populate=images,variants`,
      { headers: getStrapiHeaders() }
    );

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json: StrapiResponse<StrapiProduct[]> = await res.json();
    return json.data.map(mapStrapiProduct);
  } catch (error) {
    console.error('Failed to fetch products from Strapi:', error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/products/${id}?populate=images,variants`,
      { headers: getStrapiHeaders() }
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json: StrapiResponse<StrapiProduct> = await res.json();
    return mapStrapiProduct(json.data);
  } catch (error) {
    console.error('Failed to fetch product from Strapi:', error);
    return null;
  }
}
