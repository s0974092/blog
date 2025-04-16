import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 獲取所有子主題的文章數量
    const subCategories = await prisma.subcategory.findMany({
      select: {
        id: true,
        _count: {
          select: {
            posts: true
        }
      }
    }
    })

    // 將結果轉換為 { subCategoryId: count } 的格式
    const counts = subCategories.reduce((acc, subCategory) => {
      acc[subCategory.id] = subCategory._count.posts
      return acc
    }, {} as Record<number, number>)

    return NextResponse.json({ success: true, counts })
  } catch (error) {
    console.error('獲取子主題文章數量失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取子主題文章數量失敗' },
      { status: 500 }
    )
  }
} 