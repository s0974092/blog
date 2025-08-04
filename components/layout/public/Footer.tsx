import Link from 'next/link';
import Image from 'next/image';
import { Mail, Globe, Github, Linkedin } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo 和品牌資訊 */}
          <div className="flex flex-col items-start">
            <Link href="/blog" className="flex items-center gap-2 mb-4">
              <Image src="/yj-brand-logo.png" alt="YJ's Tech & Life Notes" width={40} height={40} />
              <span className="text-xl font-bold font-[firacode] text-gray-900">YJ's Tech & Life Notes</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              分享技術心得、生活感悟，記錄成長路上的點點滴滴。
            </p>
          </div>
          
          {/* 快速連結 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
                  部落格首頁
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  關於我
                </Link>
              </li>
              {/* <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  管理後台
                </Link>
              </li> */}
            </ul>
          </div>
          
          {/* 聯絡資訊 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">聯絡資訊</h3>
            <div className="space-y-3">
              <a 
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors text-sm"
              >
                <Mail size={16} />
                <span>{CONTACT_INFO.email}</span>
              </a>
              <a 
                href={CONTACT_INFO.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <Github size={16} />
                <span>GitHub: {CONTACT_INFO.github.username}</span>
              </a>
              <a 
                href={CONTACT_INFO.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <Linkedin size={16} />
                <span>LinkedIn: {CONTACT_INFO.linkedin.username}</span>
              </a>
              <a 
                href={CONTACT_INFO.website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <Globe size={16} />
                <span>{CONTACT_INFO.website.name}</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* 版權資訊 */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 YJ's Tech & Life Notes. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                隱私政策
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                使用條款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 