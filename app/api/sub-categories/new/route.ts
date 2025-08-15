import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const subCategorySchema = z.object({
  name: z.string().min(1, '子主題名稱不能為空').max(30, '子主題名稱不能超過30個字符'),
  categoryId: z.number().int().positive('無效的主題ID'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = subCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, categoryId } = validation.data

    // 檢查主題是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: '找不到指定的主題' },
        { status: 404 }
      )
    }

    // 檢查子主題名稱是否已存在
    const existingSubCategory = await prisma.subcategory.findFirst({
      where: {
        name,
        categoryId
      }
    })

    if (existingSubCategory) {
      return NextResponse.json(
        { success: false, error: '該主題下已存在相同名稱的子主題' },
        { status: 400 }
      )
    }

    const subCategory = await prisma.subcategory.create({
      data: {
        name,
        categoryId,
      },
    })

    return NextResponse.json({ success: true, data: subCategory })
  } catch (error) {
    console.error('建立子主題失敗:', error)
    return NextResponse.json(
      { success: false, error: '建立子主題失敗' },
      { status: 500 }
    )
  }
} 