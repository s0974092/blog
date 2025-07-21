// app/api/ai-generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { translate } from '@vitalets/google-translate-api';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  // 自動翻譯成英文
  let translatedPrompt = prompt;
  try {
    const translation = await translate(prompt, { to: 'en' });
    translatedPrompt = translation.text;
  } catch (e) {
    // 若翻譯失敗，仍用原始 prompt
    console.error('翻譯失敗，將直接使用原始 prompt', e);
  }
  const finalPrompt = `${translatedPrompt}, 16:9, wide aspect ratio, 1200x630`;
  console.log('finalPrompt', finalPrompt);

  const response = await fetch('https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: finalPrompt,
    }),
  });

  if (!response.ok) {
    let errMsg = '生成失敗';
    try {
      const err = await response.json();
      errMsg = err.error || errMsg;
    } catch {
      errMsg = await response.text();
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = blob.type || 'image/jpeg';

  return NextResponse.json({ image: `data:${mimeType};base64,${base64}` });
}