'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type CategoryContextType = {
  newCategoryId: number | null
  setNewCategoryId: (id: number | null) => void
  newSubCategoryId: number | null
  setNewSubCategoryId: (id: number | null) => void
  newTagId: number | null
  setNewTagId: (id: number | null) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null)
  const [newSubCategoryId, setNewSubCategoryId] = useState<number | null>(null)
  const [newTagId, setNewTagId] = useState<number | null>(null)

  return (
    <CategoryContext.Provider value={{ 
      newCategoryId, 
      setNewCategoryId,
      newSubCategoryId,
      setNewSubCategoryId,
      newTagId,
      setNewTagId
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategoryContext() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider')
  }
  return context
} 