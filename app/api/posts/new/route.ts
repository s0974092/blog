import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/server-auth'
import { revalidatePath } from 'next/cache';

// 文章驗證schema
const postSchema = z.object({
  title: z.string().min(1, "標題不能為空").max(100, "標題不能超過100個字元"),
  slug: z.string().min(1, "Slug不能為空").max(300, "Slug不能超過300個字元"),
  categoryId: z.number().optional().nullable(),
  subcategoryId: z.number().optional().nullable(),
  tagIds: z.array(z.number()).optional().default([]),
  content: z.any().optional(), // Yoopta content is JSON
  contentText: z.string().optional(), // Plain text content
  isPublished: z.boolean().default(false),
  coverImageUrl: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation for published state
  if (data.isPublished) {
    // 移除 title 的條件驗證，因為它現在總是必填
    if (!data.slug || data.slug.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['slug'],
        message: "發布文章時，Slug 不能為空",
      });
    }
    if (data.categoryId === null || data.categoryId! <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: "發布文章時，請選擇主題",
      });
    }
    // Validate content (Yoopta JSON content)
    if (!data.content || (typeof data.content === 'string' && data.content.trim().length === 0) || (typeof data.content === 'object' && Object.keys(data.content).length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: "發布文章時，內容不能為空",
      });
    }
    // Validate contentText (plain text content)
    if (!data.contentText || data.contentText.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contentText'],
        message: "發布文章時，純文字內容不能為空",
      });
    }
    // Cover image validation for published state
    if (!data.coverImageUrl || data.coverImageUrl.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coverImageUrl'],
        message: "發布文章時，請提供有效的圖片（base64 或 URL）",
      });
    } else {
      const isValidFormat = /^data:image\//.test(data.coverImageUrl) || /^https?:\/\/.+/.test(data.coverImageUrl);
      if (!isValidFormat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coverImageUrl'],
          message: "圖片格式不正確，請提供有效的 base64 或 URL",
        });
      }
    }
  }
  // General cover image format validation (if not published, but image is provided)
  else if (data.coverImageUrl && data.coverImageUrl.length > 0) {
    const isValidFormat = /^data:image\//.test(data.coverImageUrl) || /^https?:\/\/.+/.test(data.coverImageUrl);
    if (!isValidFormat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coverImageUrl'],
        message: "圖片格式不正確，請提供有效的 base64 或 URL",
      });
    }
  }
});

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

    const { slug } = validation.data;

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
    
    const { contentText, categoryId, subcategoryId } = validation.data;

    // 創建文章並同時建立 PostTag 關聯
    const post = await prisma.post.create({
      data: {
        title: validation.data.title,
        content: validation.data.content,
        contentText: contentText, // 儲存純文字版本
        ...(categoryId !== null && categoryId !== undefined && { categoryId: categoryId }),
        ...(subcategoryId !== null && subcategoryId !== undefined && { subcategoryId: subcategoryId }),
        slug: validation.data.slug,
        authorId: user.id,
        createdBy: user.id,
        published: validation.data.isPublished,
        coverImageUrl: validation.data.coverImageUrl,
        tags: {
          create: validation.data.tagIds.map((tagId: number) => ({
            tagId,
            createdBy: user.id,
          })),
        },
      },
    });

    revalidatePath('/blog'); // 重新驗證部落格列表頁面
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
