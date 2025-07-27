import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/server-auth'

// 文章驗證schema
const postSchema = z.object({
  slug: z.string().min(1, 'Slug名稱不能為空'),
  coverImageUrl: z.string().optional(),
})

// POST /api/posts/new - 創建新文章
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    // 需要登錄才能創建
    if (!user) {
      return NextResponse.json(
        { success: false, error: '無權限創建標籤' },
        { status: 401 }
      )
    }
    
    // 解析並驗證請求數據
    const body = await request.json()
    const validation = postSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { slug, coverImageUrl } = validation.data;

    // 檢查文章名稱是否已存在
    const existingSlug = await prisma.post.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive'
        }
      }
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Slug名稱已存在' },
        { status: 400 }
      );
    }
    
    // 創建文章並同時建立 PostTag 關聯
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId,
        slug: body.slug,
        authorId: user.id,
        createdBy: user.id,
        published: body.isPublished,
        coverImageUrl: body.coverImageUrl,
        tags: {
          create: body.tagIds.map((tagId: number) => ({
            tagId,
            createdBy: user.id,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: post
    }, { 
      status: 201 
    })
  } catch (error) {
    console.error('創建文章錯誤:', error)
    return NextResponse.json(
      { success: false, error: '創建文章失敗' },
      { status: 500 }
    )
  }
}
