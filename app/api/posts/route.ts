import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // 構建查詢條件
    const where: Prisma.PostWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // 查詢文章列表和總數
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
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
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // 轉換文章列表，將 tags 陣列中的 tag 物件轉換為 tag 名稱
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(tag => tag.tag),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: transformedPosts,
        total,
        page,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('獲取文章列表失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取文章列表失敗' },
      { status: 500 }
    );
  }
}