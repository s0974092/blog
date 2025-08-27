import { YooptaContentValue } from "@yoopta/editor";

export interface Post {
  id: string | number;
  slug: string;
  title: string;
  coverImageUrl?: string;
  content?: YooptaContentValue;
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
  category?: { id: number; name: string };
  subcategory?: { id: number; name: string };
  tags?: { id: string | number; name: string }[];
}