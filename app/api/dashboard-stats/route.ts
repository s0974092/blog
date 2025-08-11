import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';

export async function GET() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [postCount, categoryCount, subCategoryCount, tagCount] =
      await prisma.$transaction([
        prisma.post.count(),
        prisma.category.count(),
        prisma.subcategory.count(),
        prisma.tag.count(),
      ]);

    return NextResponse.json({
      postCount,
      categoryCount,
      subCategoryCount,
      tagCount,
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
