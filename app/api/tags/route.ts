import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/core/services/tag.service';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// 標籤驗證schema
const tagSchema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(50, '標籤名稱不能超過50個字符')
});

const tagService = new TagService();

// GET /api/tags - 獲取所有標籤
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
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
