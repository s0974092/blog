import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 主題驗證schema
const categorySchema = z.object({
  name: z.string().min(1, '主題名稱不能為空').max(30, '主題名稱不能超過30個字符')
})

// GET /api/categories/[id] - 獲取單個主題信息
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的主題 ID' },
        { status: 400 }
      )
    }

    const includePosts = req.nextUrl.searchParams.get('posts') === 'true';
    const includeSubCategories = req.nextUrl.searchParams.get('subcategories') === 'true';

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

    if (includeSubCategories) {
      // 獲取主題相關的子主題
      const subCategories = await prisma.subcategory.findMany({
        where: {
          categoryId: id
        },
        select: {
          id: true,
          name: true
        }
      })

      return NextResponse.json({
        success: true,
        data: { subCategories }
      })
    }

    // 如果不需要文章和子主題，只返回主題信息
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '無權限刪除主題' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = Number(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的主題 ID' },
        { status: 400 }
      )
    }

    // 查找默認主題
    const defaultCategory = await prisma.category.findFirst({
      where: {
        isDefault: true
      }
    })

    if (!defaultCategory) {
      return NextResponse.json(
        { success: false, error: '未找到默認主題' },
        { status: 500 }
      )
    }

    // 禁止刪除默認主題
    if (id === defaultCategory.id) {
      return NextResponse.json(
        { success: false, error: '不能刪除默認主題' },
        { status: 400 }
      )
    }

    // 事務：更新文章、刪除子主題和主題
    await prisma.$transaction(async (tx) => {
      // 1. 將相關聯的文章更新到默認主題
      await tx.post.updateMany({
        where: {
          categoryId: id
        },
        data: {
          categoryId: defaultCategory.id
        }
      })

      // 2. 刪除所有關聯的子主題 (onDelete: Cascade 會自動處理)
      // 3. 刪除主題
      await tx.category.delete({
        where: {
          id
        }
      })
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    
    // 需要登錄才能更新
    if (!user) {
      return NextResponse.json(
        { success: false, error: '無權限更新主題' },
        { status: 401 }
      )
    }

    const params = await context.params;
    const id = Number(params.id);

    if (isNaN(id)) {
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
          id
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
        id
      },
      data: {
        name,
        updatedBy: user.id,
        updatedAt: new Date(),
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