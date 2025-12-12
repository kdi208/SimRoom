import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, systemPrompt } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash-lite'),
    system: systemPrompt,
    prompt: prompt,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
