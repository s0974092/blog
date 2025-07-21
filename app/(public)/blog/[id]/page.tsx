'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/types/post-card';

export default function BlogDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [post, setPost] = useState<PostCard | undefined>(undefined);

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts/${id}`);
      const result = await res.json();
      setPost(result.data);
    }
    if (id) fetchPost();
  }, [id]);

  if (!post) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/blog" className="text-blue-600 mb-4 inline-block">&larr; 返回列表</Link>
      {post?.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post?.title ?? ''} className="w-full aspect-[16/9] object-cover rounded mb-6" />
      )}
      <h1 className="text-3xl font-bold mb-2">{post?.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {new Date(post.created_at).toLocaleDateString('zh-TW')}
        {post.category?.name && <> · {post.category.name}</>}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map(tag => (
          <span key={tag.id} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
            {tag.name}
          </span>
        ))}
      </div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
      />
    </div>
  );
} 