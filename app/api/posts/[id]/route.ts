import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server';

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

      // 針對post物件中，將tags陣列中的tag物件轉換為tag的id與name
      const transformedTags = post.tags.map((tag) => ({
        id: tag.tag.id,
        name: tag.tag.name,
      }));
      // 將原本的post物件中tags移除，並重新加入轉換後的tags
      // 建立一個新的物件，幾post物件的所有屬性，除了tags外
      const { ...rest } = post;
      const transformedPost = {
        ...rest,
        tags: transformedTags,
        created_at: post.createdAt?.toISOString?.() ?? '',
        updated_at: post.updatedAt?.toISOString?.() ?? '',
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

export async function PUT(
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
      const body = await request.json();
      const { title, content, categoryId, subCategoryId, tagIds, isPublished, slug, coverImageUrl, contentText } = body;

      if (!title || !content) {
        return NextResponse.json(
          { success: false, error: '標題和內容為必填項' },
          { status: 400 }
        );
      }

      // 檢查 tags 是否有效
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
          contentText: contentText, // 儲存純文字版本
          categoryId,
          subcategoryId: subCategoryId,
          published: isPublished,
          slug,
          coverImageUrl,
        }
      });

      // find postTag by postId and delete all and then add new tags
      await prisma.postTag.deleteMany({
        where: { postId: updatedPost.id },
      });

      // if tags is not empty, create new postTag
      if (!tagIds || tagIds.length === 0) {
        return NextResponse.json({ success: true, data: updatedPost });
      }
      
      // create new postTag
      await prisma.postTag.createMany({
        data: tagIds.map((tagId: number) => ({
          postId: updatedPost.id,
          tagId: tagId,
        })),
      })

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