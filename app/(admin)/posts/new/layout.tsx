'use client'

import { CategoryProvider } from './context'

export default function NewPostLayout({
  children,
  modal,
}: {
  children: React.ReactNode,
  modal: React.ReactNode
}) {
  return (
    <CategoryProvider>
      {children}
      {modal}
    </CategoryProvider>)
} 