export interface BannerEntry {
  _id: string;
  image: string;          // S3 key (e.g. "banners/banner-123.png")
  updatedAt?: string;
  imageUrl?: string;      // Signed URL returned from backend
}
