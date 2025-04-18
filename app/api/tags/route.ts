import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tags - 獲取所有標籤
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const all = searchParams.get('all') === 'true';
    
    // 如果請求所有標籤（不分頁）
    if (all) {
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          items: tags,
          total: tags.length
        }
      });
    }
    
    // 分頁獲取標籤
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.tag.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: tags,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('獲取標籤列表失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取標籤列表失敗' },
      { status: 500 }
    );
  }
}
