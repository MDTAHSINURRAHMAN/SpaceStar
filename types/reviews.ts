export interface Review {
  _id: string;
  productId: string;
  name: string;
  rating: number;
  subtext?: string;
  review: string;
  image?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
