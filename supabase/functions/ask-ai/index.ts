
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, imageUrl, conversationHistory, model } = await req.json();

    // Get user's API keys and settings from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user settings
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('id', user.id)
      .single();

    // Determine which provider to use
    const provider = settings?.selected_provider || "openai";
    const apiKeys = settings?.api_keys || {};
    const models = settings?.models || {};

    // Compose system message as before
    let systemMessage = settings.common_instruction || 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。LaTeX記法を使用する際は、インライン数式は$...$、ブロック数式は$$...$$で囲んでください。';
    let customInstruction = '';
    if (Array.isArray(settings.subject_configs)) {
      const foundConfig = settings.subject_configs.find((conf: any) => conf.id === subject);
      if (foundConfig && foundConfig.instruction && foundConfig.instruction.length > 0) {
        customInstruction = foundConfig.instruction;
      }
    }
    if (!customInstruction && settings.subject_instructions && settings.subject_instructions[subject]) {
      customInstruction = settings.subject_instructions[subject];
    }
    if (customInstruction) {
      systemMessage += '\n\n' + customInstruction;
    }

    // Prepare conversation history (up to 10 latest entries)
    let messages = [];
    if (provider === "openai") {
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

    // Determine selected model
    let selectedModel =
      model ||
      (provider === "openai"
        ? models.openai
        : provider === "anthropic"
        ? models.anthropic
        : provider === "google"
        ? models.google
        : "gpt-4o");

    if (typeof selectedModel !== "string") selectedModel = "gpt-4o";
    selectedModel = selectedModel.toLowerCase();

    let aiResponse = "";
    let usedModel = selectedModel;
    let cost = 0;

    // ---- 1. OpenAI ----
    if (provider === "openai") {
      if (!apiKeys.openai) throw new Error("OpenAI API key not configured");

      // モデル名正規化（OpenAI用のみ）
      const modelMapping: { [key: string]: string } = {
        'gpt-4.1-2025-04-14': 'gpt-4.1-2025-04-14',
        'o3-2025-04-16': 'o3-2025-04-16',
        'o4-mini-2025-04-16': 'o4-mini-2025-04-16',
        'gpt-4o': 'gpt-4o',
        'gpt-4': 'gpt-4',
        'gpt-4-turbo': 'gpt-4-turbo',
      };
      usedModel = modelMapping[selectedModel] || 'gpt-4o';
      console.log('Sending request to OpenAI with model:', usedModel);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: usedModel,
          messages: messages,
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
      aiResponse = data.choices[0].message.content;

      // コスト計算（OpenAIの暫定値）
      const inputTokens = JSON.stringify(messages).length / 4; // rough estimate
      const outputTokens = aiResponse.length / 4;
      cost = (inputTokens * 0.00001) + (outputTokens * 0.00003);

    }
    // ---- 2. Anthropic（Claude） ----
    else if (provider === "anthropic") {
      if (!apiKeys.anthropic) throw new Error("Anthropic API key not configured");

      // Claude v4/3/Haiku などAPIエンドポイント・headers用途共通
      // モデル名は設定値をそのまま使用
      // Claudeは system prompt ではなく systemプロパティで渡す
      // 会話履歴作成
      const clMessages: any[] = [];
      if (systemMessage) {
        clMessages.push({ role: "system", content: systemMessage });
      }
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.slice(-10).forEach((m: any) => {
          clMessages.push({
            role: m.role,
            content: m.content
          });
        });
      }
      clMessages.push({
        role: "user",
        content: message
      });

      // 注意：Anthropic API の正式仕様にあわせて system/prompt 配置
      const anthropicReq = {
        model: selectedModel,
        max_tokens: 2048,
        messages: clMessages,
        temperature: 0.7,
      };

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKeys.anthropic,
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
      aiResponse = data.content[0]?.text ?? "";

      // コスト計算（暫定: 目安としてOpenAI方式流用、正式にはAnthropic仕様参照）
      const inputTokens = JSON.stringify(clMessages).length / 4;
      const outputTokens = aiResponse.length / 4;
      cost = (inputTokens * 0.000015) + (outputTokens * 0.000045);

      usedModel = selectedModel;

    }
    // ---- 3. Google Gemini ----
    else if (provider === "google") {
      if (!apiKeys.google) throw new Error("Google Gemini API key not configured");

      // モデル名を使う
      // system prompt: Geminiは contextPartsとして扱う
      const contentParts: any[] = [];
      if (systemMessage) contentParts.push({ text: systemMessage });
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.slice(-10).forEach((m: any) => {
          contentParts.push({ text: (m.content || "") });
        });
      }
      contentParts.push({ text: message });

      // リクエスト形式
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKeys.google}`;
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
      // データ構造注意: candidates[0].content.parts[0].text
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // コスト計算（暫定: 仮値~OpenAIベース）
      const inputTokens = JSON.stringify(contentParts).length / 4; // rough estimate
      const outputTokens = aiResponse.length / 4;
      cost = (inputTokens * 0.000008) + (outputTokens * 0.000032);

      usedModel = selectedModel;
    }
    // ---- その他: 未知プロバイダー ----
    else {
      throw new Error("Unknown AI provider. Only openai, anthropic, google are supported.");
    }
    // ---- レスポンス返却 ----

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
