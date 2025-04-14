import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // 計算分頁
    const skip = (page - 1) * pageSize

    // 構建查詢條件
    const where: Prisma.CategoryWhereInput = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      : {}

    // 執行查詢
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('獲取主題列表失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取主題列表失敗' },
      { status: 500 }
    )
  }
} 