import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.category.upsert({
      where: { name: '未分類' },
      update: { isDefault: true },
      create: { name: '未分類', isDefault: true },
    });
    console.log('Default category "未分類" seeded successfully.');
  } catch (e) {
    console.error('Error seeding default category:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();