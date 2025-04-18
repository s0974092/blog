'use client'

import NewTagDialog from '@/components/tag/new-tag-dialog'
import { useCategoryContext } from '../../context'

export default function NewTagDialogPage() {
  const { setNewTagId } = useCategoryContext()

  return <NewTagDialog onTagCreated={setNewTagId} />
} 