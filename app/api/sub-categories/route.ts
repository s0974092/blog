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
    const where: Prisma.SubcategoryWhereInput = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      : {}

    // 執行查詢
    const [subCategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          category: true,
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.subcategory.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: subCategories,
      pagination: {
        page,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('獲取子主題列表失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取子主題列表失敗' },
      { status: 500 }
    )
  }
} 