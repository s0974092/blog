export interface Post {
  id: string | number;
  slug: string;
  title: string;
  coverImageUrl?: string;
  content?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  published?: boolean;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string };
  tags?: { id: string | number; name: string }[];
}