import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">頁面未找到</p>
      <p className="text-gray-500 dark:text-gray-500 mt-2">抱歉，您要查找的頁面不存在。</p>
      <Link href="/" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        返回首頁
      </Link>
    </div>
  );
}
