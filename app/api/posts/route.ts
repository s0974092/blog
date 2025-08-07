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
    const all = searchParams.get('all') === 'true';
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const sort = searchParams.get('sort') || 'newest';

    // 構建查詢條件
    let where: Prisma.PostWhereInput = all ? {} : { published: true };
    // 如果有搜尋關鍵字，添加搜尋條件
    if (search) {
      where = {
        ...where,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { contentText: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (categoryId) {
      where = { ...where, categoryId: Number(categoryId) };
    }
    if (subCategoryId) {
      where = { ...where, subcategoryId: Number(subCategoryId) };
    }

    // 決定排序條件
    let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'title-asc') orderBy = { title: 'asc' };
    if (sort === 'title-desc') orderBy = { title: 'desc' };

    // 查詢文章列表和總數
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
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

    // 轉換文章列表，將 tags 陣列中的 tag 物件轉換為 tag 名稱，並將日期轉為 ISO 字串
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(tag => tag.tag),
      created_at: post.createdAt?.toISOString?.() ?? '',
      updated_at: post.updatedAt?.toISOString?.() ?? '',
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