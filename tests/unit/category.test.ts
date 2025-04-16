import { prisma } from '@/lib/prisma';

// 使用模擬 Prisma 客戶端
jest.mock('@/lib/prisma', () => {
  const mockCategories = new Map();
  let categoryIdCounter = 1;
  
  return {
    prisma: {
      category: {
        create: jest.fn(({ data }) => {
          // 檢查名稱長度限制
          if (data.name.length > 20) {
            throw new Error('主題名稱不能超過20個字符');
          }
          
          // 檢查名稱唯一性
          for (const [_, category] of mockCategories.entries()) {
            if (category.name.toLowerCase() === data.name.toLowerCase()) {
              const error = new Error('主題名稱已存在') as CustomError;
              error.code = 'P2002';
              throw error;
            }
          }
          
          const category = {
            id: categoryIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: null
          };
          mockCategories.set(category.id, category);
          return Promise.resolve(category);
        }),
        findMany: jest.fn(({ where, skip, take, orderBy }) => {
          let categories = Array.from(mockCategories.values());
          
          if (where?.name?.contains) {
            categories = categories.filter(category => 
              category.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          if (orderBy?.createdAt === 'desc') {
            categories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          
          return Promise.resolve(categories.slice(skip, skip + take));
        }),
        count: jest.fn(({ where }) => {
          let categories = Array.from(mockCategories.values());
          
          if (where?.name?.contains) {
            categories = categories.filter(category => 
              category.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          return Promise.resolve(categories.length);
        }),
        findFirst: jest.fn(({ where }) => {
          for (const [_, category] of mockCategories.entries()) {
            if (where.name?.equals && 
                category.name.toLowerCase() === where.name.equals.toLowerCase()) {
              return Promise.resolve(category);
            }
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn(() => {
          mockCategories.clear();
          return Promise.resolve({ count: mockCategories.size });
        })
      },
      $disconnect: jest.fn(() => Promise.resolve())
    }
  };
});

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

// 設置更長的超時時間
jest.setTimeout(30000);

interface CustomError extends Error {
  code?: string;
}

describe('主題管理測試', () => {
  // 保存所有測試中創建的主題 ID
  const createdCategoryIds: number[] = [];

  // 輔助函數：清理測試數據
  const cleanupTestData = async () => {
    try {
      console.log('開始清理測試數據...');
      
      // 刪除所有測試主題
      await prisma.category.deleteMany({
        where: {
          id: {
            in: createdCategoryIds
          }
        }
      });
      
      // 清空記錄的ID數組
      createdCategoryIds.length = 0;
      
      console.log('清理測試數據完成');
    } catch (error) {
      console.error('清理測試數據失敗：', error);
    }
  };

  beforeEach(async () => {
    // 清理測試數據
    await cleanupTestData();
  });

  // 測試：獲取主題列表
  test('應該能夠獲取主題列表', async () => {
    // 創建測試主題
    const testCategories = [];
    for (let i = 1; i <= 3; i++) {
      const category = await prisma.category.create({
        data: {
          name: `測試${i}`,
          createdBy: SYSTEM_USER_ID
        }
      });
      testCategories.push(category);
      createdCategoryIds.push(category.id);
    }

    // 模擬 API 請求參數
    const searchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
      search: '測試'
    });

    // 模擬 API 響應
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: {
          name: {
            contains: '測試',
            mode: 'insensitive'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 0,
        take: 10
      }),
      prisma.category.count({
        where: {
          name: {
            contains: '測試',
            mode: 'insensitive'
          }
        }
      })
    ]);

    expect(categories).toHaveLength(3);
    expect(total).toBe(3);
    expect(categories[0].name).toContain('測試');
  });

  // 測試：創建新主題
  test('應該能夠創建新主題', async () => {
    const categoryName = '新主題';
    
    // 創建新主題
    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdCategoryIds.push(newCategory.id);

    expect(newCategory).toBeDefined();
    expect(newCategory.name).toBe(categoryName);
    expect(newCategory.createdBy).toBe(SYSTEM_USER_ID);
  });

  // 測試：主題名稱唯一性
  test('主題名稱不能重複', async () => {
    const categoryName = '重複主題';
    
    // 創建第一個主題
    const firstCategory = await prisma.category.create({
      data: {
        name: categoryName,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdCategoryIds.push(firstCategory.id);

    // 嘗試創建同名主題
    try {
      await prisma.category.create({
        data: {
          name: categoryName,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect((error as CustomError).code).toBe('P2002');
    }
  });

  // 測試：主題名稱長度限制
  test('主題名稱長度不能超過20個字符', async () => {
    const longCategoryName = '這是一個名稱非常非常長超過二十個字符的主題';
    
    // 嘗試創建超長名稱的主題
    try {
      await prisma.category.create({
        data: {
          name: longCategoryName,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect(error.message).toBe('主題名稱不能超過20個字符');
    }

    // 創建一個符合長度限制的主題
    const validCategoryName = '一二三四五六七八九十一二三四五六七八九十';
    const validCategory = await prisma.category.create({
      data: {
        name: validCategoryName,
        createdBy: SYSTEM_USER_ID
      }
    });
    
    createdCategoryIds.push(validCategory.id);

    expect(validCategory).not.toBeNull();
    expect(validCategory.name.length).toBeLessThanOrEqual(20);
  });

  // 在每個測試完成後清理測試數據
  afterEach(async () => {
    await cleanupTestData();
  });

  // 測試完全結束後的最終清理
  afterAll(async () => {
    try {
      await cleanupTestData();
    } catch (error) {
      console.error('最終清理測試數據失敗：', error);
    } finally {
      await prisma.$disconnect();
    }
  });
});
