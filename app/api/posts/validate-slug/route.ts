import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const exists = await prisma.post.findUnique({
      where: { slug },
    });

    return NextResponse.json({ exists: !!exists });
  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}