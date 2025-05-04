export interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  designer: string;
  features: string[];
  price: number;
  category: string;
  stock: number;
  images: string[];
  isPreOrder: boolean;
  sizes: string[];
  colors: string[];
  material: string;
  weight: string;
  dimensions: string;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice: string;
  createdAt: string;
  updatedAt: string;
}
