import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultCategoryName = '未分類';

  // 使用 upsert 來創建或更新默認分類
  // 這可以確保腳本重複運行也不會出錯
  const defaultCategory = await prisma.category.upsert({
    where: { 
      // 我們用一個獨特且固定的方式來尋找這個分類
      // 這裡我們假設分類名稱是唯一的，或者我們可以添加一個獨特的標識符
      // 為了簡單起見，我們暫時用名稱來查找
      name: defaultCategoryName 
    },
    update: {
      isDefault: true,
    },
    create: {
      name: defaultCategoryName,
      isDefault: true,
    },
  });

  console.log(`✅ Default category '${defaultCategory.name}' ensured to exist.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
