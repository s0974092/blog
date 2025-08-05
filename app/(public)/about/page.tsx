import Image from 'next/image';
import Link from 'next/link';
import { Mail, Globe, Github, Linkedin, ArrowLeft } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 頁面標題 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">關於我</h1>
        <p className="text-xl text-gray-600">分享技術與生活的點點滴滴</p>
      </div>

      {/* 個人介紹區塊 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <Image 
              src="/yj-brand-logo.png" 
              alt="YJ's Profile" 
              width={240} 
              height={240}
              className="rounded-md shadow-lg"
            />
          </div>
          <div className="flex flex-col flex-1 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">YJ</h2>
            <p className="text-gray-600 leading-relaxed">
              你好！我是YJ(Jason)，一名具備產品思維且熱愛技術的開發者。
            </p>
            <p className="text-gray-600 leading-relaxed">
              在AI當道的時代，我致力於與AI一起協作與打造SaaS產品。並將這些知識與經驗分享給更多志同道合的朋友。
            </p>
            <p className="text-gray-600 leading-relaxed">
              除了技術，我也關注生活的美好瞬間。這裡記錄的不只是程式碼，更是成長路上的點點滴滴。
            </p>
          </div>
        </div>
      </div>

      {/* Logo理念區塊 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">YJ Monogram 設計理念</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              {/* Y字母的向量圖形 */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white">
                <path d="M12 8L24 20L36 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M24 20L24 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="20" r="2" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">字母「Y」的含義</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              線條以開口向上的「Y」形呈現，象徵開放的學習態度與包容性。
              Y 代表羅馬拼音「Yu-Jie」第一個音的字首，也象徵「Your」→ 強調部落格是「你的筆記」概念。
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              {/* J字母的向量圖形 */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white">
                {/* 頂部橫線 */}
                <path d="M16 5L32 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                {/* 右側豎線 */}
                <path d="M32 5L32 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                {/* 底部彎曲部分 */}
                <path d="M32 34C32 38 28 42 24 42C20 42 16 38 16 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                {/* 底部小點 */}
                <circle cx="16" cy="34" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">字母「J」的含義</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              線條以豎劃明確呈現「J」，是 Jason 及 Yu-Jie 第二個音的字首，也代表 Journal（筆記）、Journey（旅程）的意涵。
              橘色為溫暖色調，讓整體專業感中帶有「親和與個性化」。
            </p>
          </div>
        </div>
        
        {/* 書本輪廓說明 */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl">
          <div className="flex items-center justify-center mb-4">
            {/* 書本的圖片 */}
            <Image 
              src="/open-book.png" 
              alt="打開的書本" 
              width={96} 
              height={96}
              className="rounded-full"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">書本輪廓設計</h3>
          <p className="text-gray-600 text-sm leading-relaxed text-center">
            外框像一本展開的書，代表知識、思考與記錄，符合「Code. Think. Life.」的理念。
          </p>
          <p className="text-gray-600 text-sm leading-relaxed text-center">
            書本的對稱設計也象徵系統架構思維的平衡與邏輯性。
          </p>
        </div>
      </div>

      {/* 專長 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">專長</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-8xl mb-3">💻</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Stack Developer</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Angular</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">React</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Vue</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Next.js</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">TypeScript</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Tailwind CSS</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Node.js</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Express.js</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Java</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Spring Boot</span>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">RESTful API</span>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="text-8xl mb-3">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Design</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">0 to 1</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">需求分析</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">使用者經驗設計</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">微服務架構設計</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">資料庫設計</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">API 設計</span>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">SEO</span>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="text-8xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Soft Skill</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">AI協作</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">ChatGPT</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Cursor</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Windsurf</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Claude Code</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">Ownership</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">同理心</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">產品思維</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">策略思維</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">注重細節</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">團隊合作</span>
            </div>
          </div>
        </div>
      </div>

      {/* 聯絡方式 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">聯絡方式</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a 
            href={`mailto:${CONTACT_INFO.email}`}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-sky-50 hover:border-sky-200 border-2 border-transparent transition-all duration-300 cursor-pointer group"
          >
            <Mail size={24} className="text-gray-600 group-hover:text-sky-600 transition-colors" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-sky-900 transition-colors">Email</h3>
              <span className="text-gray-600 group-hover:text-sky-600 transition-colors">
                {CONTACT_INFO.email}
              </span>
            </div>
          </a>
          
          <a 
            href={CONTACT_INFO.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:border-gray-300 border-2 border-transparent transition-all duration-300 cursor-pointer group"
          >
            <Github size={24} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">GitHub</h3>
              <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                github.com/{CONTACT_INFO.github.username}
              </span>
            </div>
          </a>
          
          <a 
            href={CONTACT_INFO.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all duration-300 cursor-pointer group"
          >
            <Linkedin size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">LinkedIn</h3>
              <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                linkedin.com/in/{CONTACT_INFO.linkedin.username}
              </span>
            </div>
          </a>
          
          <a 
            href={CONTACT_INFO.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-green-50 hover:border-green-200 border-2 border-transparent transition-all duration-300 cursor-pointer group"
          >
            <Globe size={24} className="text-gray-600 group-hover:text-green-600 transition-colors" />
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-900 transition-colors">個人網站</h3>
              <span className="text-gray-600 group-hover:text-green-600 transition-colors">
                {CONTACT_INFO.website.name}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* 返回按鈕 */}
      <div className="text-center mt-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首頁
        </Link>
      </div>
    </div>
  );
} 