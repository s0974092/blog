'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Tags, ChevronLeft, ChevronRight, Palette } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const menuItems = [
  { name: '儀表板', path: '/dashboard', icon: LayoutDashboard },
  { name: '文章維護', path: '/posts', icon: FileText },
  { name: '主題維護', path: '/categories', icon: Palette },
  { name: '標籤維護', path: '/tags', icon: Tags }
]

interface AdminLayoutProps {
  children: React.ReactNode
  userProfile?: React.ReactNode // 新增 userProfile 屬性
}

export default function AdminLayout({
  children,
  userProfile // 接收 userProfile 組件
}: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    router.push(path)
  }

  return (
    <div className="flex h-screen">
      {/* 側邊菜單 */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-48'
      }`}>
        <div className="p-4 flex justify-between items-center">
          <h1 className={`font-bold ${collapsed ? 'hidden' : 'block'}`}>管理後台</h1>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded cursor-pointer"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-4">
          <TooltipProvider>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleMenuClick(item.path, e)}
                  className={`flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer ${
                    pathname === item.path ? 'bg-gray-700' : ''
                  }`}
                >
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon size={20} className="min-w-[20px] cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Icon size={20} className="min-w-[20px]" />
                      <span className="ml-3">{item.name}</span>
                    </>
                  )}
                </Link>
              )
            })}
          </TooltipProvider>
        </nav>
      </div>
      
      {/* 主要內容區域 */}
      <div className="flex-1 overflow-auto">
          {/* 用戶資料區域 */}
          {userProfile && (
            <div className="px-6 py-4 bg-gray-200">
              {userProfile}
            </div>
          )}
          
          {/* 主要內容 */}
          <div className="p-6">
            {children}
          </div>
      </div>
    </div>
  )
} 