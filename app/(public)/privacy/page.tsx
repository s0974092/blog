import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFormattedCurrentDate } from '@/lib/utils';
import { LEGAL_CONFIG } from '@/lib/constants';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 返回按钮 */}
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        返回首頁
      </Link>

      {/* 标题 */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私政策</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最後更新：{getFormattedCurrentDate()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 資訊收集</h2>
            <p className="text-gray-700 mb-4">
              本部落格網站（以下簡稱「本網站」）致力於保護您的隱私。我們收集的資訊包括：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>您自願提供的資訊，如評論、留言等</li>
              <li>瀏覽器自動傳送的技術資訊，如IP地址、瀏覽器類型、作業系統等</li>
              <li>使用分析數據，如頁面瀏覽量、停留時間等</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 資訊使用</h2>
            <p className="text-gray-700 mb-4">
              我們使用收集的資訊用於：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>提供和改善網站服務</li>
              <li>分析網站使用情況以優化用戶體驗</li>
              <li>回應您的評論和問題</li>
              <li>防止濫用和確保網站安全</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 資訊分享</h2>
            <p className="text-gray-700 mb-4">
              我們不會出售、交易或轉讓您的個人資訊給第三方，除非：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>獲得您的明確同意</li>
              <li>法律要求或政府機關要求</li>
              <li>保護本網站和用戶的安全</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 第三方服務</h2>
            <p className="text-gray-700 mb-4">
              本網站可能使用第三方服務，包括：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Google Analytics（網站分析）</li>
              <li>Supabase（資料庫服務）</li>
              <li>Vercel（網站託管服務）</li>
            </ul>
            <p className="text-gray-700 mt-4">
              這些第三方服務有自己的隱私政策，建議您查看其相關條款。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 資料安全</h2>
            <p className="text-gray-700 mb-4">
              我們採取適當的技術和組織措施來保護您的資訊，包括：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>使用HTTPS加密傳輸</li>
              <li>定期更新安全措施</li>
              <li>限制對個人資訊的存取權限</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookie 使用</h2>
            <p className="text-gray-700 mb-4">
              本網站使用Cookie來改善用戶體驗。您可以透過瀏覽器設定來管理Cookie偏好。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 您的權利</h2>
            <p className="text-gray-700 mb-4">
              您有權：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>要求存取您的個人資訊</li>
              <li>要求更正不準確的資訊</li>
              <li>要求刪除您的個人資訊</li>
              <li>反對處理您的個人資訊</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 政策更新</h2>
            <p className="text-gray-700 mb-4">
              我們可能會不時更新本隱私政策。重大變更將在網站上公告，並更新「最後更新」日期。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. 聯絡我們</h2>
            <p className="text-gray-700 mb-4">
              如果您對本隱私政策有任何問題或疑慮，請透過以下方式聯絡我們：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <a 
                  href={`mailto:${LEGAL_CONFIG.contact.email}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {LEGAL_CONFIG.contact.email}
                </a>
              </li>
              <li>
                GitHub Issues：
                <a 
                  href={LEGAL_CONFIG.contact.githubIssues}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {LEGAL_CONFIG.contact.githubIssues}
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. 開源聲明</h2>
            <p className="text-gray-700 mb-4">
              本網站程式碼為開源專案，遵循MIT許可證。您可以在GitHub上查看完整程式碼：
            </p>
            <p className="text-gray-700">
              <a 
                href={LEGAL_CONFIG.github.repository}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {LEGAL_CONFIG.github.repository}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 