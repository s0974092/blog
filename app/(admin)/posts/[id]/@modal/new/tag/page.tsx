'use client'

import { useCategoryContext } from '@/components/post/context'
import NewTagDialog from '@/components/tag/new-tag-dialog'

export default function NewTagDialogPage() {
  const { setNewTagId } = useCategoryContext()

  return <NewTagDialog onTagCreated={setNewTagId} />
} 