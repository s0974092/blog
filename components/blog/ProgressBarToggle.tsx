'use client'

import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarToggleProps {
  onToggle: (showTopBar: boolean) => void;
  defaultShowTopBar?: boolean;
}

const STORAGE_KEY = 'progressBarPreference';

// 進度條設置面板組件
function ProgressSettings({ showTopBar, onToggle, isOpen, onClose }: { 
  showTopBar: boolean; 
  onToggle: (value: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div className={cn(
      "fixed top-32 w-64 bg-white/80 backdrop-blur-md rounded shadow px-4 py-3 border border-gray-200 z-50 transform transition-all duration-300 ease-in-out",
      isOpen
        ? "translate-x-0 opacity-100 right-8"
        : "translate-x-full opacity-0 right-0 pointer-events-none"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-700">進度條設置</div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="progressBar"
            checked={showTopBar}
            onChange={() => onToggle(true)}
            className="text-blue-600"
          />
          <span className="text-sm text-gray-600">頂部橫幅進度條</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="progressBar"
            checked={!showTopBar}
            onChange={() => onToggle(false)}
            className="text-blue-600"
          />
          <span className="text-sm text-gray-600">按鈕進度指示器</span>
        </label>
      </div>
    </div>
  );
}

// 浮動按鈕組件
function FloatingButton({ 
  onClick, 
  isVisible
}: { 
  onClick: () => void;
  isVisible: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-1/3 right-0 transform translate-x-1/3 hover:translate-x-0 w-10 h-10 bg-white text-blue-500 rounded-l-full shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] transition-all duration-200 z-30 flex items-center justify-center",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      aria-label="進度條設置"
    >
      <Settings size={24} />
    </button>
  );
}

export default function ProgressBarToggle({ onToggle, defaultShowTopBar = true }: ProgressBarToggleProps) {
  const [showTopBar, setShowTopBar] = useState(defaultShowTopBar);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 初始化時從 localStorage 讀取用戶偏好
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(STORAGE_KEY);
      if (savedPreference !== null) {
        const preference = JSON.parse(savedPreference);
        setShowTopBar(preference.showTopBar);
        onToggle(preference.showTopBar);
      }
    } catch (error) {
      console.warn('無法讀取進度條偏好設置:', error);
    }
  }, [onToggle]);

  const handleToggle = (newValue: boolean) => {
    setShowTopBar(newValue);
    onToggle(newValue);
    
    // 保存到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ showTopBar: newValue }));
    } catch (error) {
      console.warn('無法保存進度條偏好設置:', error);
    }
  };

  // 點擊外部關閉面板 和 ESC 鍵關閉面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown); // Add keydown listener
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown); // Clean up keydown listener
    };
  }, [isOpen]);

  return (
    <div ref={panelRef}> {/* panelRef should be on the root element of this component */}
      {/* 浮動按鈕 */}
      <FloatingButton 
        onClick={() => setIsOpen(true)}
        isVisible={!isOpen}
      />
      
      {/* 設置面板 */}
      <ProgressSettings 
        showTopBar={showTopBar}
        onToggle={handleToggle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
} 