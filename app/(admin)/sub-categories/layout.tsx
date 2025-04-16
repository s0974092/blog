interface CategoriesLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function CategoriesLayout({ children, modal }: CategoriesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
} 