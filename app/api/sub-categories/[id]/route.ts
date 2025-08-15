import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const subCategorySchema = z.object({
  name: z.string().min(1, '子主題名稱不能為空').max(30, '子主題名稱不能超過30個字符'),
  categoryId: z.number().int().positive('無效的主題ID'),
})

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id)
    const body = await request.json()
    const validation = subCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, categoryId } = validation.data

    const subCategory = await prisma.subcategory.update({
      where: {
        id,
      },
      data: {
        name,
        categoryId,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(subCategory)
  } catch (error) {
    console.error('更新子主題失敗:', error)
    return NextResponse.json(
      { error: '更新子主題失敗' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id)
    const subCategory = await prisma.subcategory.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        posts: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    if (!subCategory) {
      return NextResponse.json(
        { success: false, error: '找不到子主題' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: subCategory
    })
  } catch (error) {
    console.error('取得子主題失敗:', error)
    return NextResponse.json(
      { success: false, error: '取得子主題失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await context.params).id)
    
    // 檢查子主題是否存在
    const subCategory = await prisma.subcategory.findUnique({
      where: { id },
    })
    
    if (!subCategory) {
      return NextResponse.json(
        { success: false, error: '找不到子主題' },
        { status: 404 }
      )
    }
    
    // 刪除子主題
    await prisma.subcategory.delete({
      where: { id },
    })
    
    return NextResponse.json({
      success: true,
      message: '子主題刪除成功'
    })
  } catch (error) {
    console.error('刪除子主題失敗:', error)
    return NextResponse.json(
      { success: false, error: '刪除子主題失敗' },
      { status: 500 }
    )
  }
}