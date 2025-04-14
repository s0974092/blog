import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 主題驗證schema
const categorySchema = z.object({
  name: z.string().min(1, '主題名稱不能為空').max(50, '主題名稱不能超過50個字符')
})

// GET /api/categories/[id] - 獲取單個主題信息
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    // const { searchParams } = new URL(request.url)
    // const includePosts = searchParams.get('posts') === 'true'
    // const categoryId = parseInt(context.params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的主題 ID' },
        { status: 400 }
      )
    }

    const includePosts = req.nextUrl.searchParams.get('posts') === 'true';

    if (includePosts) {
      // 獲取主題相關的文章
      const posts = await prisma.post.findMany({
        where: {
          categoryId: id
        },
        select: {
          id: true,
          title: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: { posts }
      })
    }

    // 如果不需要文章，只返回主題信息
    const category = await prisma.category.findUnique({
      where: {
        id: id
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: '主題不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('獲取主題信息失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取主題信息失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // 需要登錄才能刪除
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '無權限刪除主題' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(context.params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: '無效的主題 ID' },
        { status: 400 }
      )
    }

    // 刪除主題
    await prisma.category.delete({
      where: {
        id: categoryId
      }
    })

    return NextResponse.json({
      success: true,
      message: '主題刪除成功'
    })
  } catch (error) {
    console.error('刪除主題失敗:', error)
    return NextResponse.json(
      { success: false, error: '刪除主題失敗' },
      { status: 500 }
    )
  }
}

// PATCH /api/categories/[id] - 更新主題
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // 需要登錄才能更新
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '無權限更新主題' },
        { status: 401 }
      )
    }

    const categoryId = parseInt(context.params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: '無效的主題 ID' },
        { status: 400 }
      )
    }

    // 解析並驗證請求數據
    const body = await request.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name } = validation.data

    // 檢查主題名稱是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        NOT: {
          id: categoryId
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: '主題名稱已存在' },
        { status: 400 }
      )
    }

    // 更新主題
    const category = await prisma.category.update({
      where: {
        id: categoryId
      },
      data: {
        name,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('更新主題失敗:', error)
    return NextResponse.json(
      { success: false, error: '更新主題失敗' },
      { status: 500 }
    )
  }
} 