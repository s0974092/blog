import { getServerUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 主題驗證schema
const categorySchema = z.object({
  name: z.string().min(1, '主題名稱不能為空').max(50, '主題名稱不能超過50個字符')
})

// POST /api/categories/new - 創建新主題
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    // 需要登錄才能創建
    if (!user) {
      return NextResponse.json(
        { success: false, error: '無權限創建主題' },
        { status: 401 }
      )
    }

    // 解析並驗證請求數據
    const body = await request.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name } = validation.data

    // 檢查主題名稱是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: '主題名稱已存在' },
        { status: 400 }
      )
    }

    // 創建新主題
    const category = await prisma.category.create({
      data: {
        name,
        createdBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    }, { 
      status: 201 
    })
  } catch (error) {
    console.error('創建主題錯誤:', error)
    return NextResponse.json(
      { success: false, error: '創建主題失敗' },
      { status: 500 }
    )
  }
} 