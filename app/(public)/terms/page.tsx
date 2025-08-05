import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFormattedCurrentDate } from '@/lib/utils';
import { LEGAL_CONFIG } from '@/lib/constants';

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">使用條款</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最後更新：{getFormattedCurrentDate()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 接受條款</h2>
            <p className="text-gray-700 mb-4">
              透過訪問和使用本部落格網站（以下簡稱「本網站」），您同意遵守這些使用條款。如果您不同意這些條款，請不要使用本網站。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 網站使用</h2>
            <p className="text-gray-700 mb-4">
              您承諾：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>僅將本網站用於合法目的</li>
              <li>不從事任何可能損害網站或影響其他用戶的行為</li>
              <li>不嘗試未經授權存取網站系統</li>
              <li>不發布任何違法、有害、威脅、辱罵或侵犯他人權利的內容</li>
              <li>尊重其他用戶的權利和隱私</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 智慧財產權</h2>
            <p className="text-gray-700 mb-4">
              本網站的所有內容，包括但不限於文字、圖片、程式碼、設計等，均受智慧財產權法保護。
            </p>
            <p className="text-gray-700 mb-4">
              <strong>網站程式碼：</strong>本網站程式碼採用MIT開源許可證，您可以：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>自由使用、修改和分發程式碼</li>
              <li>用於商業和非商業目的</li>
              <li>在您的專案中使用本程式碼</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>網站內容：</strong>部落格文章和原創內容版權歸作者所有，未經許可不得複製或商業使用。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 用戶生成內容</h2>
            <p className="text-gray-700 mb-4">
              如果您在本網站發布評論或其他內容，您：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>保留您內容的版權</li>
              <li>授予我們使用、顯示和分發您內容的權利</li>
              <li>承諾您有權發布該內容</li>
              <li>同意內容不會侵犯他人權利</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 免責聲明</h2>
            <p className="text-gray-700 mb-4">
              本網站按「現狀」提供，我們不保證：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>網站將無錯誤或中斷運行</li>
              <li>網站內容的準確性、完整性或時效性</li>
              <li>第三方連結的安全性</li>
              <li>網站適合特定用途</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 責任限制</h2>
            <p className="text-gray-700 mb-4">
              在法律允許的最大範圍內，我們不對因使用本網站而產生的任何直接、間接、偶然或特殊損害承擔責任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. 第三方連結</h2>
            <p className="text-gray-700 mb-4">
              本網站可能包含指向第三方網站的連結。我們不對這些網站的內容或隱私政策負責。訪問這些網站時請自行承擔風險。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. 服務變更</h2>
            <p className="text-gray-700 mb-4">
              我們保留隨時修改、暫停或終止本網站服務的權利，無需事先通知。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. 條款修改</h2>
            <p className="text-gray-700 mb-4">
              我們可能會不時更新這些使用條款。重大變更將在網站上公告。繼續使用本網站即表示您接受更新後的條款。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. 開源專案聲明</h2>
            <p className="text-gray-700 mb-4">
              本網站為開源專案，遵循MIT許可證。這意味著：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>程式碼完全開放，任何人都可以查看、使用和修改</li>
              <li>您可以自由使用程式碼建立自己的專案</li>
              <li>我們歡迎社群貢獻和改進建議</li>
              <li>程式碼託管在GitHub上，遵循開源最佳實踐</li>
            </ul>
            <p className="text-gray-700 mt-4">
              專案地址：
              <a 
                href={LEGAL_CONFIG.github.repository}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline ml-2"
              >
                {LEGAL_CONFIG.github.repository}
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. 適用法律</h2>
            <p className="text-gray-700 mb-4">
              這些條款受中華民國法律管轄。任何爭議將透過友好協商解決，如無法解決，將提交有管轄權的法院處理。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. 聯絡我們</h2>
            <p className="text-gray-700 mb-4">
              如果您對這些使用條款有任何問題，請透過以下方式聯絡我們：
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
        </div>
      </div>
    </div>
  );
} 