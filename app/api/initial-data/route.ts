import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/initial-data - 獲取主題和標籤的初始數據
export async function GET() {
  try {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tag.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        tags,
      },
    });
  } catch (error) {
    console.error('獲取初始數據失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取初始數據失敗' },
      { status: 500 }
    );
  }
}