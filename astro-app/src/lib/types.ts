export interface ProductVariant {
  id: number;
  size: string;
  stock: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  image_urls: string[];
  collection_name: string | null;
  variants: ProductVariant[];
}
