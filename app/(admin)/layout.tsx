import AuthLayout from '@/components/ui/layout/admin/AuthLayout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
} 