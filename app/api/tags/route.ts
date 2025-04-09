import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/core/services/tag.service';
import { auth } from '@/lib/auth';
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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          id: 'desc'  // 按照 ID 降序排序
        }
      }),
      prisma.tag.count({ where }),
    ]);

    return NextResponse.json({
      data: tags,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('獲取標籤列表失敗：', error);
    return NextResponse.json(
      { error: '獲取標籤列表失敗' },
      { status: 500 }
    );
  }
}

// POST /api/tags - 創建新標籤
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log('session', session);
    
    // 需要登錄才能創建
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '無權限創建標籤' },
        { status: 401 }
      );
    }
    
    // 解析並驗證請求數據
    const body = await request.json();
    const validation = tagSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // 創建標籤
    const { name } = validation.data;
    const result = await tagService.createTag({
      name,
      createdBy: session.user.id
    });
    
    return NextResponse.json(result, { 
      status: result.success ? 201 : 400 
    });
  } catch (error) {
    console.error('創建標籤錯誤:', error);
    return NextResponse.json(
      { success: false, error: '創建標籤失敗' },
      { status: 500 }
    );
  }
} 