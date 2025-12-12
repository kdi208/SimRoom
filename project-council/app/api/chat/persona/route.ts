import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

const google = createGoogleGenerativeAI();

export async function POST(req: Request) {
  const { prompt, systemPrompt, history } = await req.json();

  // Ensure history is an array, default to empty
  const previousMessages = Array.isArray(history) ? history : [];

  // Add the new user prompt as the last message
  const messages = [...previousMessages, { role: 'user', content: prompt }];

  const result = await streamText({
    model: google('gemini-2.5-flash-lite'),
    system: systemPrompt,
    messages: messages,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
