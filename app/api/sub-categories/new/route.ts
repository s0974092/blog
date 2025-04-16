import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId } = body

    // 檢查必填欄位
    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, error: '請填寫所有必填欄位' },
        { status: 400 }
      )
    }

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