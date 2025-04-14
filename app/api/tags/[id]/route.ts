import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 標籤驗證schema
const tagSchema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(50, '標籤名稱不能超過50個字符')
});

// GET /api/tags/[id] - 獲取單個標籤信息
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的標籤 ID' },
        { status: 400 }
      );
    }
    
    const includePosts = req.nextUrl.searchParams.get('posts') === 'true';
    
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: includePosts ? {
        posts: true
      } : undefined,
    });
    
    if (!tag) {
      return NextResponse.json(
        { success: false, error: '標籤不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('獲取標籤失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取標籤失敗' },
      { status: 500 }
    );
  }
}

// PATCH /api/tags/[id] - 更新標籤
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的標籤 ID' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const validatedData = tagSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, error: validatedData.error.errors[0].message },
        { status: 400 }
      );
    }

    // 檢查標籤名稱是否已存在（排除當前標籤）
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: validatedData.data.name,
          mode: 'insensitive'
        },
        NOT: {
          id: id
        }
      }
    });
    
    if (existingTag) {
      return NextResponse.json(
        { success: false, error: '標籤名稱已存在' },
        { status: 400 }
      );
    }
    
    const tag = await prisma.tag.update({
      where: { id },
      data: validatedData.data,
    });
    
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: '標籤不存在' },
          { status: 404 }
        );
      }
    }
    console.error('更新標籤失敗:', error);
    return NextResponse.json(
      { success: false, error: '更新標籤失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - 刪除標籤
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的標籤 ID' },
        { status: 400 }
      );
    }
    
    await prisma.tag.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: '標籤不存在' },
          { status: 404 }
        );
      }
    }
    console.error('刪除標籤失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除標籤失敗' },
      { status: 500 }
    );
  }
} 