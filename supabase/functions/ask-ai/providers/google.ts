
import "https://deno.land/x/xhr@0.1.0/mod.ts";

export interface GoogleRequestParams {
  apiKey: string;
  model: string;
  systemMessage: string;
  conversationHistory: any[];
  message: string;
}

export interface GoogleResult {
  aiResponse: string;
  usedModel: string;
  cost: number;
}

export async function requestGoogle({
  apiKey, model, systemMessage, conversationHistory, message
}: GoogleRequestParams): Promise<GoogleResult> {
  let geminiModel = model;
  const supportedModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.5-pro"];
  if (!supportedModels.includes(geminiModel)) {
    geminiModel = "gemini-1.5-pro";
  }
  const contentParts: any[] = [];
  if (systemMessage) contentParts.push({ text: systemMessage });
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-10).forEach((m: any) => {
      contentParts.push({ text: (m.content || "") });
    });
  }
  contentParts.push({ text: message });
  let apiVersion = "v1beta";
  if (geminiModel === "gemini-2.5-pro") {
    apiVersion = "v1";
  }
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${geminiModel}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: contentParts }]
    })
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Google Gemini API error: ${response.status} - ${errorData}`);
  }
  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const inputTokens = JSON.stringify(contentParts).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.000008) + (outputTokens * 0.000032);

  return { aiResponse, usedModel: geminiModel, cost };
}
