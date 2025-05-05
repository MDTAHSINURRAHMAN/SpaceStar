export interface BannerEntry {
  _id: string;
  image: string; // S3 key (e.g. "banners/12345-banner.png")
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string; // Optional signed URL returned by backend (if needed)
}
