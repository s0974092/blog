'use client'

import { useSearchParams } from 'next/navigation'
import NewSubCategoryDialog from '@/components/sub-category/new-sub-category-dialog'
import { useCategoryContext } from '../../context'

export default function NewSubCategoryInPostPage() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const { setNewSubCategoryId } = useCategoryContext()
  
  return (
    <NewSubCategoryDialog 
      defaultCategoryId={categoryId ? parseInt(categoryId) : undefined}
      onSubCategoryCreated={setNewSubCategoryId}
    />
  )
}
