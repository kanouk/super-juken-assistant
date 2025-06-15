
import "https://deno.land/x/xhr@0.1.0/mod.ts";

export interface OpenAIRequestParams {
  apiKey: string;
  model: string;
  messages: any[];
}

export interface OpenAIResult {
  aiResponse: string;
  usedModel: string;
  cost: number;
}

const modelMapping: { [key: string]: string } = {
  'gpt-4.1-2025-04-14': 'gpt-4.1-2025-04-14',
  'o3-2025-04-16': 'o3-2025-04-16',
  'o4-mini-2025-04-16': 'o4-mini-2025-04-16',
  'gpt-4o': 'gpt-4o',
  'gpt-4': 'gpt-4',
  'gpt-4-turbo': 'gpt-4-turbo',
};

export async function requestOpenAI({ apiKey, model, messages }: OpenAIRequestParams): Promise<OpenAIResult> {
  const usedModel = modelMapping[model] || 'gpt-4o';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: usedModel,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }
  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  // コスト計算（暫定値）
  const inputTokens = JSON.stringify(messages).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.00001) + (outputTokens * 0.00003);

  return { aiResponse, usedModel, cost };
}
