'use client'

import { PostCard } from '@/types/post-card';
import Link from 'next/link';

export default function BlogCard(post: PostCard) {
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {post.coverImageUrl && (
        <Link href={`/blog/${post.id}`}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full aspect-[16/9] object-cover"
          />
        </Link>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold mb-2">
          <Link href={`/blog/${post.id}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>
        <div className="text-xs text-gray-500 mb-2">
          {new Date(post.created_at).toLocaleDateString('zh-TW')}
        </div>
        {post.category?.name && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
            {post.category.name}
          </span>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags?.map(tag => (
            <span key={tag.id} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
              {tag.name}
            </span>
          ))}
        </div>
        <p className="text-gray-700 mt-2 line-clamp-2">{post.content?.slice(0, 80)}...</p>
      </div>
    </article>
  );
} 