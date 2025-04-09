interface TagsLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
}

export default function TagsLayout({ children, modal }: TagsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
} 