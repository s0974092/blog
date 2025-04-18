'use client'

import NewCategoryDialog from '@/components/category/new-category-dialog'
import { useCategoryContext } from '../../context'

export default function NewCategoryInPostPage() {
  const { setNewCategoryId } = useCategoryContext()

  return <NewCategoryDialog onCategoryCreated={setNewCategoryId} />
}
