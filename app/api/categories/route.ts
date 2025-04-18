import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const all = searchParams.get('all') === 'true';
    
    // 構建查詢條件
    const where: Prisma.CategoryWhereInput = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      : {};
    
    // 如果請求所有主題（不分頁）
    if (all) {
      const categories = await prisma.category.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          items: categories,
          total: categories.length
        }
      });
    }
    
    // 分頁獲取主題
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.category.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: categories,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('獲取主題列表失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取主題列表失敗' },
      { status: 500 }
    );
  }
} 