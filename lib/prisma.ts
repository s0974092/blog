import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

// Avoid creating multiple Prisma instances in a development environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * A cached function to fetch a single post by its ID or slug.
 * It first checks if the identifier is a UUID. If so, it queries by the id field.
 * Otherwise, it assumes the identifier is a slug and queries by the slug field.
 */
export const getPostById = cache(async (identifier: string) => {
  // Regular expression to check for UUID format.
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-([0-9a-fA-F]{12})$/.test(identifier);

  const post = await prisma.post.findUnique({
    where: isUuid ? { id: identifier } : { slug: identifier },
    include: {
      category: true,
      subcategory: true,
      tags: { include: { tag: true } },
    },
  });
  return post;
});