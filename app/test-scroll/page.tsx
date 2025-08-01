'use client'

import { useState, useEffect } from 'react';
import ScrollToTop from '@/components/blog/ScrollToTop';

export default function TestScrollPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrollY(scrollTop);
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">ScrollToTop 組件測試</h1>
        
        {/* 調試信息 */}
        <div className="mb-8 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm">
            當前滾動位置: <strong>{scrollY}px</strong><br/>
            觸發距離: <strong>100px</strong><br/>
            按鈕應該顯示: <strong>{isVisible ? '是' : '否'}</strong><br/>
            組件狀態: <strong>{isVisible ? '可見' : '隱藏'}</strong><br/>
            開發模式: <strong>{process.env.NODE_ENV === 'development' ? '是' : '否'}</strong>
          </p>
        </div>
        
        {/* 添加一些內容來測試滾動 */}
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">測試區塊 {i + 1}</h2>
            <p className="text-gray-600 mb-4">
              這是一個測試區塊，用來驗證 ScrollToTop 組件是否在滾動一小段距離後就出現。
              請向下滾動來測試功能。
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-500">
                滾動超過 100px 後，右下角應該會出現置頂按鈕。
                按鈕會顯示閱讀進度，並且可以點擊回到頂部。
              </p>
            </div>
          </div>
        ))}
        
        {/* 最後一個區塊 */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">測試完成</h2>
          <p className="text-blue-700">
            如果您看到右下角的置頂按鈕，並且可以點擊回到頂部，那麼功能就正常工作了！
          </p>
        </div>
      </div>
      
      {/* 測試固定定位 */}
      <div 
        className="fixed bottom-6 right-6 z-[70] p-3 bg-red-500 text-white rounded-full shadow-lg"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 70
        }}
      >
        測試固定定位
      </div>
      
      {/* ScrollToTop 組件 */}
      <ScrollToTop triggerDistance={100} />
      
      {/* 強制顯示的測試按鈕 */}
      <button
        className="fixed bottom-6 left-6 z-[70] p-3 bg-green-500 text-white rounded-full shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        強制顯示測試
      </button>
    </div>
  );
} 