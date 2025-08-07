'use client'

import { Post } from '@/types/post-card';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BlogCardProps {
  post: Post;
  priority?: boolean;
  onCategoryClick?: (id: number | undefined) => void;
  onSubCategoryClick?: (id: number | undefined) => void;
  onTagClick?: (name: string) => void;
}

export default function BlogCard({ post, priority = false, onCategoryClick, onSubCategoryClick, onTagClick }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
    >
      {post.coverImageUrl && (
        <Link href={`/blog/${post.slug}`}>
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={600}
            height={338}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full aspect-[16/9] object-cover"
            priority={priority}
          />
        </Link>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>
        <div className="text-xs text-gray-500 mb-2">
          {post.created_at ? new Date(post.created_at).toLocaleDateString('zh-TW') : ''}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {post.category?.name && (
            <button
              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
              type="button"
              onClick={() => onCategoryClick?.(post.category?.id)}
            >
              {post.category.name}
            </button>
          )}
          {post.subcategory?.name && (
            <button
              className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition"
              type="button"
              onClick={() => onSubCategoryClick?.(post.subcategory?.id)}
            >
              {post.subcategory.name}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags?.map(tag => (
            <button
              key={tag.id}
              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition"
              type="button"
              onClick={() => onTagClick?.(tag.name)}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>
    </motion.article>
  );
} 