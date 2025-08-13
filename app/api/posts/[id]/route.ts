import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const params = await context.params;
      const id = params.id;
      
      if (id === 'undefined' || id === null) {
        return NextResponse.json(
          { success: false, error: '無效的文章 ID' },
          { status: 400 }
        );
      }
      // 判斷 id 是否為 uuid，否則用 slug 查詢
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
      const post = await prisma.post.findUnique({
        where: isUuid ? { id } : { slug: id },
        include: {
          category: true,
          subcategory: true,
          tags: {
            select: {
                tag: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
          },
        },
      });
      
      if (!post) {
        return NextResponse.json(
          { success: false, error: '文章不存在' },
          { status: 404 }
        );
      }

      const { tags, createdAt, updatedAt, ...rest } = post;
      const transformedPost = {
        ...rest,
        tags: tags.map((t) => t.tag),
        created_at: createdAt?.toISOString?.() ?? '',
        updated_at: updatedAt?.toISOString?.() ?? '',
      };
      
      return NextResponse.json({ success: true, data: transformedPost });
    } catch (error) {
      console.error('獲取文章失敗:', error);
      return NextResponse.json(
        { success: false, error: '獲取文章失敗' },
        { status: 500 }
      );
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const params = await context.params;
      const id = params.id;

      if (id === 'undefined' || id === null) {
        return NextResponse.json(
          { success: false, error: '無效的文章 ID' },
          { status: 400 }
        );
      }
      
      const body = await request.json();

      // Define a schema for the update operation. All fields are optional for update,
      // but conditional validation will apply based on `isPublished`.
      const updatePostSchema = z.object({
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

      const validation = updatePostSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { title, content, categoryId, subcategoryId, tagIds, isPublished, slug, coverImageUrl, contentText } = validation.data;

      // 判斷 id 是否為 uuid，否則用 slug 查詢
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

      // 檢查 tags 是否有效 (這部分邏輯保持不變，但現在是在 Zod 驗證之後)
      if (tagIds && tagIds.length > 0) {
        const validTags = await prisma.tag.findMany({
          where: {
            id: { in: tagIds },
          },
          select: { id: true },
        });

        const validTagIds = validTags.map((tag) => tag.id);
        const invalidTags = tagIds.filter((tagId: number) => !validTagIds.includes(tagId));

        if (invalidTags.length > 0) {
          return NextResponse.json(
            { success: false, error: `無效的標籤 ID: ${invalidTags.join(', ')}` },
            { status: 400 }
          );
        }
      }

      const updatedPost = await prisma.post.update({
        where: isUuid ? { id } : { slug: id },
        data: {
          title,
          content,
          contentText, // 儲存純文字版本
          categoryId: categoryId as number | undefined,
          subcategoryId: subcategoryId === null ? undefined : subcategoryId,
          published: isPublished,
          slug,
          coverImageUrl,
          updatedAt: new Date(),
        }
      });

      // find postTag by postId and delete all and then add new tags
      await prisma.postTag.deleteMany({
        where: { postId: updatedPost.id },
      });

      // if tags is not empty, create new postTag
      if (!tagIds || tagIds.length === 0) {
        revalidatePath(`/blog/${updatedPost.slug}`); // 重新驗證文章詳情頁面
        return NextResponse.json({ success: true, data: updatedPost });
      }
      
      // create new postTag
      await prisma.postTag.createMany({
        data: tagIds.map((tagId: number) => ({
          postId: updatedPost.id,
          tagId: tagId,
        })),
      })

      revalidatePath(`/blog/${updatedPost.slug}`); // 重新驗證文章詳情頁面
      return NextResponse.json({ success: true, data: updatedPost });
    } catch (error) {
      console.error('更新文章失敗:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return NextResponse.json(
            { success: false, error: '文章或相關資源不存在' },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: '更新文章失敗' },
        { status: 500 }
      );
    }
}