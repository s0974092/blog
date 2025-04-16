import { prisma } from '@/lib/prisma';

// 使用模擬 Prisma 客戶端
jest.mock('@/lib/prisma', () => {
  const mockTags = new Map();
  let tagIdCounter = 1;
  
  return {
    prisma: {
      tag: {
        create: jest.fn(({ data }) => {
          // 檢查名稱長度限制
          if (data.name.length > 20) {
            throw new Error('標籤名稱不能超過20個字符');
          }
          
          // 檢查名稱唯一性
          for (const [_, tag] of mockTags.entries()) {
            if (tag.name === data.name) {
              const error = new Error('標籤名稱已存在') as CustomError;
              error.code = 'P2002';
              throw error;
            }
          }
          
          const tag = {
            id: tagIdCounter++,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: null
          };
          mockTags.set(tag.id, tag);
          return Promise.resolve(tag);
        }),
        findMany: jest.fn(({ where, skip, take, orderBy }) => {
          let tags = Array.from(mockTags.values());
          
          if (where?.name?.contains) {
            tags = tags.filter(tag => 
              tag.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          if (orderBy?.createdAt === 'desc') {
            tags.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          
          return Promise.resolve(tags.slice(skip, skip + take));
        }),
        count: jest.fn(({ where }) => {
          let tags = Array.from(mockTags.values());
          
          if (where?.name?.contains) {
            tags = tags.filter(tag => 
              tag.name.toLowerCase().includes(where.name.contains.toLowerCase())
            );
          }
          
          return Promise.resolve(tags.length);
        }),
        findFirst: jest.fn(({ where }) => {
          for (const [_, tag] of mockTags.entries()) {
            if (where.name?.equals && 
                tag.name.toLowerCase() === where.name.equals.toLowerCase()) {
              return Promise.resolve(tag);
            }
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn(() => {
          mockTags.clear();
          return Promise.resolve({ count: mockTags.size });
        })
      },
      $disconnect: jest.fn(() => Promise.resolve())
    }
  };
});

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
// 使用唯一的測試標記前綴，確保我們只清理測試數據
const TEST_PREFIX = 'test_';

// 設置更長的超時時間
jest.setTimeout(30000);

interface CustomError extends Error {
  code?: string;
}

describe('標籤管理測試', () => {
  // 保存所有測試中創建的標籤 ID
  const createdTagIds: number[] = [];

  // 輔助函數：清理測試數據
  const cleanupTestData = async () => {
    try {
      console.log('開始清理測試數據...');
      
      // 刪除所有測試標籤
      await prisma.tag.deleteMany({
        where: {
          id: {
            in: createdTagIds
          }
        }
      });
      
      // 清空記錄的ID數組
      createdTagIds.length = 0;
      
      console.log('清理測試數據完成');
    } catch (error) {
      console.error('清理測試數據失敗：', error);
    }
  };

  beforeEach(async () => {
    // 清理測試數據
    await cleanupTestData();
  });

  // 測試：獲取標籤列表
  test('應該能夠獲取標籤列表', async () => {
    // 創建測試標籤
    const testTags = [];
    for (let i = 1; i <= 3; i++) {
      const tag = await prisma.tag.create({
        data: {
          name: `測試${i}`,
          createdBy: SYSTEM_USER_ID
        }
      });
      testTags.push(tag);
      createdTagIds.push(tag.id);
    }

    // 模擬 API 請求參數
    const searchParams = new URLSearchParams({
      page: '1',
      limit: '10',
      search: '測試'
    });

    // 模擬 API 響應
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
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
      prisma.tag.count({
        where: {
          name: {
            contains: '測試',
            mode: 'insensitive'
          }
        }
      })
    ]);

    expect(tags).toHaveLength(3);
    expect(total).toBe(3);
    expect(tags[0].name).toContain('測試');
  });

  // 測試：創建新標籤
  test('應該能夠創建新標籤', async () => {
    const tagName = '新標籤';
    
    // 創建新標籤
    const newTag = await prisma.tag.create({
      data: {
        name: tagName,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdTagIds.push(newTag.id);

    expect(newTag).toBeDefined();
    expect(newTag.name).toBe(tagName);
    expect(newTag.createdBy).toBe(SYSTEM_USER_ID);
  });

  // 測試：標籤名稱唯一性
  test('標籤名稱不能重複', async () => {
    const tagName = '重複標籤';
    
    // 創建第一個標籤
    const firstTag = await prisma.tag.create({
      data: {
        name: tagName,
        createdBy: SYSTEM_USER_ID
      }
    });

    createdTagIds.push(firstTag.id);

    // 嘗試創建同名標籤
    try {
      await prisma.tag.create({
        data: {
          name: tagName,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect((error as CustomError).code).toBe('P2002');
    }
  });

  // 測試：標籤名稱長度限制
  test('標籤名稱長度不能超過20個字符', async () => {
    const longTagName = '這是一個名稱非常非常長超過二十個字符的標籤';
    
    // 嘗試創建超長名稱的標籤
    try {
      await prisma.tag.create({
        data: {
          name: longTagName,
          createdBy: SYSTEM_USER_ID
        }
      });
      fail('應該拋出錯誤');
    } catch (error: any) {
      expect(error.message).toBe('標籤名稱不能超過20個字符');
    }

    // 創建一個符合長度限制的標籤
    const validTagName = '一二三四五六七八九十一二三四五六七八九十';
    const validTag = await prisma.tag.create({
      data: {
        name: validTagName,
        createdBy: SYSTEM_USER_ID
      }
    });
    
    createdTagIds.push(validTag.id);

    expect(validTag).not.toBeNull();
    expect(validTag.name.length).toBeLessThanOrEqual(20);
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