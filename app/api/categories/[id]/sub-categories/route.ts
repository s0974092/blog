import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = Number(params.id);
  
  try {
    const categoryId = id;
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類 ID' },
        { status: 400 }
      )
    }

    const subCategories = await prisma.subcategory.findMany({
      where: {
        categoryId: categoryId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      data: subCategories
    })
  } catch (error) {
    console.error('獲取子分類失敗:', error)
    return NextResponse.json(
      { error: '獲取子分類失敗' },
      { status: 500 }
    )
  }
} 