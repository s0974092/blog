import { NextRequest, NextResponse } from 'next/server'
import { TagService } from '@/core/services/tag.service'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// 標籤驗證schema
const tagSchema = z.object({
  name: z.string().min(1, '標籤名稱不能為空').max(50, '標籤名稱不能超過50個字符')
})

const tagService = new TagService()

// POST /api/tags/new - 創建新標籤
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // 需要登錄才能創建
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '無權限創建標籤' },
        { status: 401 }
      )
    }
    
    // 解析並驗證請求數據
    const body = await request.json()
    const validation = tagSchema.safeParse(body)
    
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }


    const { name } = validation.data;

    // 檢查標籤名稱是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { success: false, error: '標籤名稱已存在' },
        { status: 400 }
      );
    }
    
    // 創建標籤
    const tag = await prisma.category.create({
        data: {
            name,
            createdBy: session.user.id
        }
    })
    
    return NextResponse.json({
        success: true,
        data: tag
    }, { 
        status: 201 
    })
  } catch (error) {
    console.error('創建標籤錯誤:', error)
    return NextResponse.json(
      { success: false, error: '創建標籤失敗' },
      { status: 500 }
    )
  }
}
