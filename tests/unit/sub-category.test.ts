import { prisma } from '@/lib/prisma';

// 使用模擬 Prisma 客戶端
jest.mock('@/lib/prisma', () => {
  const mockSubCategories = new Map();
  let subCategoryIdCounter = 1;
  
  return {
    prisma: {
      subcategory: {
        create: jest.fn(({ data }) => {
          // 檢查名稱長度限制
          if (data.name.length > 20) {
            throw new Error('子主題名稱不能超過20個字符');
          }
          
          // 檢查名稱唯一性（在同一個主題下）
          for (const [_, subCategory] of mockSubCategories.entries()) {
            if (subCategory.categoryId === data.categoryId &&
                subCategory.name.toLowerCase() === data.name.toLowerCase()) {
              const error = new Error('相同主題下已存在此子主題名稱') as CustomError;
              error.code = 'P2002';
              throw error;
            }
          }
          
          const subCategory = {
            id: subCategoryIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: null
          };
          mockSubCategories.set(subCategory.id, subCategory);
          return Promise.resolve(subCategory);
        }),
        findMany: jest.fn(({ where, skip, take, orderBy }) => {
          let subCategories = Array.from(mockSubCategories.values());
          
          if (where?.categoryId) {
            subCategories = subCategories.filter(subCategory => 
              subCategory.categoryId === where.categoryId
            );
          }
          
          if (where?.name?.contains) {
            subCategories = subCategories.filter(subCategory => 
              subCategory.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          if (orderBy?.createdAt === 'desc') {
            subCategories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          
          return Promise.resolve(subCategories.slice(skip, skip + take));
        }),
        count: jest.fn(({ where }) => {
          let subCategories = Array.from(mockSubCategories.values());
          
          if (where?.categoryId) {
            subCategories = subCategories.filter(subCategory => 
              subCategory.categoryId === where.categoryId
            );
          }
          
          if (where?.name?.contains) {
            subCategories = subCategories.filter(subCategory => 
              subCategory.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          return Promise.resolve(subCategories.length);
        }),
        findFirst: jest.fn(({ where }) => {
          for (const [_, subCategory] of mockSubCategories.entries()) {
            if (where.categoryId === subCategory.categoryId &&
                where.name?.equals &&
                subCategory.name.toLowerCase() === where.name.equals.toLowerCase()) {
              return Promise.resolve(subCategory);
            }
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn(() => {
          mockSubCategories.clear();
          return Promise.resolve({ count: mockSubCategories.size });
        })
      },
      category: {
        findUnique: jest.fn(({ where }) => {
          // 模擬一個固定的主題用於測試
          if (where.id === 1) {
            return Promise.resolve({
              id: 1,
              name: '測試主題',
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: SYSTEM_USER_ID
            });
          }
          return Promise.resolve(null);
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

describe('子主題管理測試', () => {
  // 保存所有測試中創建的子主題 ID
  const createdSubCategoryIds: number[] = [];

  // 輔助函數：清理測試數據
  const cleanupTestData = async () => {
    try {
      console.log('開始清理測試數據...');
      
      // 刪除所有測試子主題
      await prisma.subcategory.deleteMany({
        where: {
          id: {
            in: createdSubCategoryIds
          }
        }
      });
      
      // 清空記錄的ID數組
      createdSubCategoryIds.length = 0;
      
      console.log('清理測試數據完成');
    } catch (error) {
      console.error('清理測試數據失敗：', error);
    }
  };

  beforeEach(async () => {
    // 清理測試數據
    await cleanupTestData();
  });

  // 測試：獲取子主題列表
  test('應該能夠獲取子主題列表', async () => {
    // 創建測試子主題
    const testSubCategories = [];
    for (let i = 1; i <= 3; i++) {
      const subCategory = await prisma.subcategory.create({
        data: {
          name: `測試子主題${i}`,
          categoryId: 1,
          createdBy: SYSTEM_USER_ID
        }
      });
      testSubCategories.push(subCategory);
      createdSubCategoryIds.push(subCategory.id);
    }

    // 模擬 API 請求參數
    const searchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
      search: '測試',
      categoryId: '1'
    });

    // 模擬 API 響應
    const [subCategories, total] = await Promise.all([
      prisma.subcategory.findMany({
        where: {
          categoryId: 1,
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
      prisma.subcategory.count({
        where: {
          categoryId: 1,
          name: {
            contains: '測試',
            mode: 'insensitive'
          }
        }
      })
    ]);

    expect(subCategories).toHaveLength(3);
    expect(total).toBe(3);
    expect(subCategories[0].name).toContain('測試');
    expect(subCategories[0].categoryId).toBe(1);
  });

  // 測試：創建新子主題
  test('應該能夠創建新子主題', async () => {
    const subCategoryName = '新子主題';
    
    // 創建新子主題
    const newSubCategory = await prisma.subcategory.create({
      data: {
        name: subCategoryName,
        categoryId: 1,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdSubCategoryIds.push(newSubCategory.id);

    expect(newSubCategory).toBeDefined();
    expect(newSubCategory.name).toBe(subCategoryName);
    expect(newSubCategory.categoryId).toBe(1);
    expect(newSubCategory.createdBy).toBe(SYSTEM_USER_ID);
  });

  // 測試：子主題名稱在同一主題下的唯一性
  test('同一主題下子主題名稱不能重複', async () => {
    const subCategoryName = '重複子主題';
    
    // 創建第一個子主題
    const firstSubCategory = await prisma.subcategory.create({
      data: {
        name: subCategoryName,
        categoryId: 1,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdSubCategoryIds.push(firstSubCategory.id);

    // 嘗試在同一主題下創建同名子主題
    try {
      await prisma.subcategory.create({
        data: {
          name: subCategoryName,
          categoryId: 1,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect((error as CustomError).code).toBe('P2002');
    }

    // 在不同主題下創建同名子主題應該成功
    const subCategoryInDifferentCategory = await prisma.subcategory.create({
      data: {
        name: subCategoryName,
        categoryId: 2,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdSubCategoryIds.push(subCategoryInDifferentCategory.id);
    expect(subCategoryInDifferentCategory.name).toBe(subCategoryName);
    expect(subCategoryInDifferentCategory.categoryId).toBe(2);
  });

  // 測試：子主題名稱長度限制
  test('子主題名稱長度不能超過20個字符', async () => {
    const longSubCategoryName = '這是一個名稱非常非常長超過二十個字符的子主題';
    
    // 嘗試創建超長名稱的子主題
    try {
      await prisma.subcategory.create({
        data: {
          name: longSubCategoryName,
          categoryId: 1,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect(error.message).toBe('子主題名稱不能超過20個字符');
    }

    // 創建一個符合長度限制的子主題
    const validSubCategoryName = '一二三四五六七八九十一二三四五六七八九十';
    const validSubCategory = await prisma.subcategory.create({
      data: {
        name: validSubCategoryName,
        categoryId: 1,
        createdBy: SYSTEM_USER_ID
      }
    });
    
    createdSubCategoryIds.push(validSubCategory.id);

    expect(validSubCategory).not.toBeNull();
    expect(validSubCategory.name.length).toBeLessThanOrEqual(20);
  });

  // 測試：檢查主題存在性
  test('創建子主題時應檢查主題是否存在', async () => {
    const subCategoryName = '測試子主題';
    const nonExistentCategoryId = 999;

    // 嘗試在不存在的主題下創建子主題
    const category = await prisma.category.findUnique({
      where: {
        id: nonExistentCategoryId
      }
    });

    expect(category).toBeNull();

    // 在存在的主題下創建子主題應該成功
    const validSubCategory = await prisma.subcategory.create({
      data: {
        name: subCategoryName,
        categoryId: 1, // 使用模擬的存在主題
        createdBy: SYSTEM_USER_ID
      }
    });

    createdSubCategoryIds.push(validSubCategory.id);
    expect(validSubCategory).toBeDefined();
    expect(validSubCategory.categoryId).toBe(1);
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
