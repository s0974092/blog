import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 標籤驗證schema
const tagSchema = z.object({
  name: z.string().min(1).max(50),
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
        { success: false, message: '无效的标签 ID' },
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
        { success: false, message: '标签不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { success: false, message: '获取标签失败' },
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
        { success: false, message: '无效的标签 ID' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const validatedData = tagSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: '无效的输入数据' },
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
          { success: false, message: '标签不存在' },
          { status: 404 }
        );
      }
    }
    console.error('更新标签失败:', error);
    return NextResponse.json(
      { success: false, message: '更新标签失败' },
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
        { success: false, message: '无效的标签 ID' },
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
          { success: false, message: '标签不存在' },
          { status: 404 }
        );
      }
    }
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { success: false, message: '删除标签失败' },
      { status: 500 }
    );
  }
} 