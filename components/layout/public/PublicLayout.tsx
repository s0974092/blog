import { ReactNode, useState, createContext, useContext } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PublicLayoutProps {
  children: ReactNode;
  enableHideOnScroll?: boolean; // 新增：控制是否啟用 Header 滾動隱藏
}

interface PublicLayoutContextType {
  headerHeight: number;
  isHeaderVisible: boolean; // 新增：Header 可見性狀態
}

const PublicLayoutContext = createContext<PublicLayoutContextType | undefined>(undefined);

export function usePublicLayout() {
  const context = useContext(PublicLayoutContext);
  if (context === undefined) {
    throw new Error('usePublicLayout must be used within a PublicLayoutProvider');
  }
  return context;
}

export default function PublicLayout({ children, enableHideOnScroll = true }: PublicLayoutProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <Header 
        onHeightChange={setHeaderHeight} 
        onVisibilityChange={setIsHeaderVisible} 
        enableHideOnScroll={enableHideOnScroll}
      />
      <PublicLayoutContext.Provider value={{ headerHeight, isHeaderVisible }}>
        <main className="flex-1">
          {children}
        </main>
      </PublicLayoutContext.Provider>
      <Footer />
    </div>
  );
} 