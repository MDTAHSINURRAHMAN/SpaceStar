export interface StoryContentBlock {
  title: string;
  description: string;
}

export interface StoryEntry {
  _id: string;
  image: string; // S3 image URL
  content: StoryContentBlock[];
  createdAt: string;
  updatedAt: string;
}
