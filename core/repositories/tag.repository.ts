import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CreateTagDTO, TagFilter, UpdateTagDTO } from '../models/tag.model';

export class TagRepository {
  /**
   * 獲取所有標籤，支持過濾條件
   */
  async findAll(filter?: TagFilter) {
    return prisma.tag.findMany({
      where: {
        ...(filter?.id && { id: filter.id }),
        ...(filter?.name && { name: { contains: filter.name, mode: 'insensitive' } }),
        ...(filter?.isTest !== undefined && { isTest: filter.isTest }),
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * 獲取單個標籤
   */
  async findById(id: number) {
    return prisma.tag.findUnique({
      where: { id }
    });
  }

  /**
   * 獲取每個標籤關聯的文章數量
   */
  async getPostCounts() {
    const postCounts = await prisma.postTag.groupBy({
      by: ['tagId'],
      _count: {
        postId: true
      }
    });
    
    return postCounts.reduce((acc, item) => {
      acc[item.tagId] = item._count.postId;
      return acc;
    }, {} as Record<number, number>);
  }

  /**
   * 獲取特定標籤關聯的文章數量
   */
  async getPostCountById(id: number) {
    const count = await prisma.postTag.count({
      where: { tagId: id }
    });
    
    return count;
  }

  /**
   * 獲取特定標籤關聯的文章
   */
  async getPostsByTagId(id: number) {
    const posts = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            tagId: id
          }
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true
      }
    });
    
    return posts;
  }

  /**
   * 創建標籤
   */
  async create(data: CreateTagDTO) {
    try {
      // 驗證標籤名稱長度
      if (data.name.length > 20) {
        throw new Error('標籤名稱不能超過20個字元');
      }

      return await prisma.tag.create({
        data: {
          name: data.name,
          createdBy: data.createdBy || null,
          updatedBy: data.createdBy || null,
          isTest: data.isTest || false
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 處理唯一約束衝突
        if (error.code === 'P2002') {
          throw new Error('標籤名稱已存在');
        }
      }
      throw error;
    }
  }

  /**
   * 更新標籤
   */
  async update(id: number, data: UpdateTagDTO) {
    try {
      return await prisma.tag.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          updatedBy: data.updatedBy || null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 處理唯一約束衝突
        if (error.code === 'P2002') {
          throw new Error('標籤名稱已存在');
        }
        // 標籤不存在
        if (error.code === 'P2025') {
          throw new Error('標籤不存在');
        }
      }
      throw error;
    }
  }

  /**
   * 刪除標籤
   */
  async delete(id: number) {
    try {
      return await prisma.tag.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 標籤不存在
        if (error.code === 'P2025') {
          throw new Error('標籤不存在');
        }
      }
      throw error;
    }
  }
} 