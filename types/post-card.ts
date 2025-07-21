export type PostCard = {
  id: string | number;
  coverImageUrl?: string;
  title: string;
  created_at: string;
  category?: {
      name: string;
  };
  tags?: {
      id: string | number;
      name: string;
  }[];
  content?: string;
};