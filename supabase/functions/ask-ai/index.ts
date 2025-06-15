
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitize(str: any): string {
  return typeof str === "string" ? str.trim() : "";
}

// --- APIキー＆モデル決定 ---
function getApiConfig(settings: any, adminSettingMap: any, userId: string) {
  // 管理者API: 無料ユーザー用
  const freeUserApiKeys = adminSettingMap['free_user_api_keys'] || {};
  const freeUserModels = adminSettingMap['free_user_models'] || {};
  // APIキー
  let apiKeys = settings?.api_keys || {};
  let models = settings?.models || {};
  let selectedProvider = settings?.selected_provider || "openai";
  let usedFreeApi = false;

  let anyUserKeySet =
    (apiKeys.openai && apiKeys.openai.trim() !== "") ||
    (apiKeys.google && apiKeys.google.trim() !== "") ||
    (apiKeys.anthropic && apiKeys.anthropic.trim() !== "");

  if (!anyUserKeySet) {
    apiKeys = {
      openai: freeUserApiKeys.openai || "",
      google: freeUserApiKeys.google || "",
      anthropic: freeUserApiKeys.anthropic || "",
    };
    models = {
      openai: freeUserModels.openai || "gpt-4o",
      google: freeUserModels.google || "gemini-1.5-pro",
      anthropic: freeUserModels.anthropic || "claude-3-sonnet",
    };
    usedFreeApi = true;
  }

  return { apiKeys, models, selectedProvider, usedFreeApi };
}

// --- システムメッセージ組み立て ---
function buildSystemMessage(settings: any, subject: string) {
  let msg = settings?.common_instruction || 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。LaTeX記法を使用する際は、インライン数式は$...$、ブロック数式は$$...$$で囲んでください。';
  let customInstruction = '';
  if (Array.isArray(settings?.subject_configs)) {
    const foundConfig = settings.subject_configs.find((conf: any) => conf.id === subject);
    if (foundConfig && foundConfig.instruction && foundConfig.instruction.length > 0) {
      customInstruction = foundConfig.instruction;
    }
  }
  if (!customInstruction && settings?.subject_instructions && settings.subject_instructions[subject]) {
    customInstruction = settings.subject_instructions[subject];
  }
  if (customInstruction) msg += '\n\n' + customInstruction;
  return msg;
}

// --- OpenAIへのリクエスト ---
async function requestOpenAI(apiKey: string, model: string, messages: any[]) {
  const modelMapping: { [key: string]: string } = {
    'gpt-4.1-2025-04-14': 'gpt-4.1-2025-04-14',
    'o3-2025-04-16': 'o3-2025-04-16',
    'o4-mini-2025-04-16': 'o4-mini-2025-04-16',
    'gpt-4o': 'gpt-4o',
    'gpt-4': 'gpt-4',
    'gpt-4-turbo': 'gpt-4-turbo',
  };
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
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  // コスト計算（暫定値）
  const inputTokens = JSON.stringify(messages).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.00001) + (outputTokens * 0.00003);
  return { aiResponse, usedModel, cost };
}

// --- Anthropicへのリクエスト ---
async function requestAnthropic(apiKey: string, model: string, systemMessage: string, conversationHistory: any[], message: string) {
  const clMessages: any[] = [];
  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-10).forEach((m: any) => {
      if (m.role === "user" || m.role === "assistant") {
        clMessages.push({
          role: m.role,
          content: m.content
        });
      }
    });
  }
  clMessages.push({
    role: "user",
    content: message
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
    console.error('Anthropic API error:', errorData);
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  const data = await response.json();
  const aiResponse = data.content[0]?.text ?? "";
  const inputTokens = JSON.stringify(clMessages).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.000015) + (outputTokens * 0.000045);
  return { aiResponse, usedModel: model, cost };
}

// --- Google Geminiへのリクエスト ---
async function requestGoogle(apiKey: string, model: string, systemMessage: string, conversationHistory: any[], message: string) {
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
    console.error('Google Gemini API error:', errorData);
    throw new Error(`Google Gemini API error: ${response.status}`);
  }
  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const inputTokens = JSON.stringify(contentParts).length / 4;
  const outputTokens = aiResponse.length / 4;
  const cost = (inputTokens * 0.000008) + (outputTokens * 0.000032);
  return { aiResponse, usedModel: geminiModel, cost };
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, imageUrl, conversationHistory, model } = await req.json();

    // Supabaseクライアント
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // ユーザー認証
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // 設定取得
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('id', user.id)
      .single();

    // 管理者デフォルト取得
    const { data: adminRows } = await supabaseClient
      .from('admin_settings')
      .select('setting_key, setting_value');

    const adminSettingMap: Record<string, any> = {};
    if (adminRows) {
      for (const row of adminRows) {
        adminSettingMap[row.setting_key] = row.setting_value;
      }
    }

    // --- APIキー・モデルどちらを使うか決定
    const { apiKeys, models, selectedProvider, usedFreeApi } = getApiConfig(settings, adminSettingMap, user.id);

    // システムメッセージ
    const systemMessage = buildSystemMessage(settings, subject);

    // --- 履歴+画像: OpenAIだけ特別対応 ---
    let messages = [];
    if (selectedProvider === "openai") {
      messages.push({ role: 'system', content: systemMessage });
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-10);
        for (const historyMessage of recentHistory) {
          messages.push({
            role: historyMessage.role,
            content: historyMessage.content
          });
        }
      }
      messages.push({
        role: 'user',
        content: imageUrl
          ? [
              { type: 'text', text: message },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          : message
      });
    }

    // モデル決定
    let selectedModel =
      model ||
      (selectedProvider === "openai"
        ? models.openai
        : selectedProvider === "anthropic"
        ? models.anthropic
        : selectedProvider === "google"
        ? models.google
        : "gpt-4o");
    if (typeof selectedModel !== "string") selectedModel = "gpt-4o";
    selectedModel = selectedModel.toLowerCase();

    let aiResponse = "";
    let usedModel = selectedModel;
    let cost = 0;

    // プロバイダー分岐
    if (selectedProvider === "openai") {
      if (!apiKeys.openai) throw new Error("OpenAI API key not configured");
      const result = await requestOpenAI(apiKeys.openai, selectedModel, messages);
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      cost = result.cost;
    } else if (selectedProvider === "anthropic") {
      if (!apiKeys.anthropic) throw new Error("Anthropic API key not configured");
      const result = await requestAnthropic(apiKeys.anthropic, selectedModel, systemMessage, conversationHistory, message);
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      cost = result.cost;
    } else if (selectedProvider === "google") {
      if (!apiKeys.google) throw new Error("Google Gemini API key not configured");
      const result = await requestGoogle(apiKeys.google, selectedModel, systemMessage, conversationHistory, message);
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      cost = result.cost;
    } else {
      throw new Error("Unknown AI provider. Only openai, anthropic, google are supported.");
    }

    // 管理者APIキー・モデル利用時は cost=0 を強制
    if (usedFreeApi) {
      cost = 0;
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      cost: cost,
      model: usedModel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ask-ai function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
