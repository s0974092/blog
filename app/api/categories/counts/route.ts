import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 使用 Prisma 的 groupBy 功能獲取每個主題的文章數量
    const categoryCounts = await prisma.post.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    })

    // 轉換數據格式
    const counts = categoryCounts.reduce((acc, item) => {
      acc[item.categoryId] = item._count.id
      return acc
    }, {} as Record<number, number>)

    return NextResponse.json({
      success: true,
      counts,
    })
  } catch (error) {
    console.error('獲取文章數量失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取文章數量失敗' },
      { status: 500 }
    )
  }
} 