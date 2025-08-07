'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">錯誤</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">發生了一些問題！</p>
      <p className="text-gray-500 dark:text-gray-500 mt-2">{error.message || '請稍後再試。'}</p>
      <div className="mt-8 space-x-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          重試
        </button>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          返回首頁
        </Link>
      </div>
    </div>
  );
}
