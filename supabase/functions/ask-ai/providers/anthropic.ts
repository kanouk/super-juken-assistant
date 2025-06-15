
import "https://deno.land/x/xhr@0.1.0/mod.ts";

export interface AnthropicRequestParams {
  apiKey: string;
  model: string;
  systemMessage: string;
  conversationHistory: any[];
  message: string;
}

export interface AnthropicResult {
  aiResponse: string;
  usedModel: string;
  cost: number;
}

export async function requestAnthropic({
  apiKey, model, systemMessage, conversationHistory, message
}: AnthropicRequestParams): Promise<AnthropicResult> {
  const clMessages: any[] = [];
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-10).forEach((m: any) => {
      if (m.role === "user" || m.role === "assistant") {
        clMessages.push({
          role: m.role,
          content: m.content,
        });
      }
    });
  }
  clMessages.push({
    role: "user",
    content: message,
  });
  const anthropicReq = {
    model,
    system: systemMessage,
    max_tokens: 2048,
    messages: clMessages,
    temperature: 0.7,
  };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify(anthropicReq)
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
  }
  const data = await response.json();
  const aiResponse = data.content[0]?.text ?? "";
  const inputTokens = JSON.stringify(clMessages).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.000015) + (outputTokens * 0.000045);
  return { aiResponse, usedModel: model, cost };
}
