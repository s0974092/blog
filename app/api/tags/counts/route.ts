import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/tags/counts - 獲取所有標籤的文章數量
export async function GET() {
  try {
    // 使用 Prisma 的 groupBy 功能獲取每個標籤的文章數量
    const tagCounts = await prisma.postTag.groupBy({
      by: ['tagId'],
      _count: {
        postId: true
      }
    })

    // 轉換數據格式
    const counts = tagCounts.reduce((acc, item) => {
      acc[item.tagId] = item._count.postId
      return acc
    }, {} as Record<number, number>)

    return NextResponse.json({
      success: true,
      counts,
    })
  } catch (error) {
    console.error('獲取標籤文章數量失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取標籤文章數量失敗' },
      { status: 500 }
    )
  }
} 