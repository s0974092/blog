
import { NextResponse } from 'next/server';
import { generatePinyin } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const slug = generatePinyin(title);
    return NextResponse.json({ slug });
  } catch (error) {
    console.error('Error generating slug:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
