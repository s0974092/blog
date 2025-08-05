import { ReactNode } from 'react';
import PublicLayout from '@/components/layout/public/PublicLayout';

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
} 