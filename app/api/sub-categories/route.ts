import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
    const all = searchParams.get('all') === 'true';
    
    // 構建查詢條件
    const where: Prisma.SubcategoryWhereInput = {
      ...(search ? {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      } : {}),
      ...(categoryId ? { categoryId } : {})
    };
    
    // 如果請求所有子主題（不分頁）
    if (all) {
      const subCategories = await prisma.subcategory.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          items: subCategories,
          total: subCategories.length
        }
      });
    }
    
    // 分頁獲取子主題
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 修改查詢以包含所屬主題的名稱
    const [subCategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          category: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.subcategory.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: subCategories,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('獲取子主題列表失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取子主題列表失敗' },
      { status: 500 }
    );
  }
}