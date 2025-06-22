
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { requestOpenAI } from "./providers/openai.ts";
import { requestAnthropic } from "./providers/anthropic.ts";
import { requestGoogle } from "./providers/google.ts";
import { getDisplayCost } from "./utils/cost.ts";
import { safeParseJson, sanitize } from "./utils/parse.ts";
import { getApiConfig } from "./utils/apiConfig.ts";
import { buildSystemMessage } from "./utils/systemMessage.ts";
import { updateUserStreak } from "./utils/streakUpdate.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- メイン処理 ---
serve(async (req) => {
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

    console.log("Current user ID:", user.id);

    // 学習ストリークを自動更新（AI質問時）
    console.log("🔥 Updating user learning streak for user:", user.id);
    await updateUserStreak(supabaseClient, user.id);

    // 設定取得
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log("User settings fetched:", settings ? "found" : "not found");

    // ユーザープロファイル取得（MBTI用）
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('mbti')
      .eq('id', user.id)
      .single();

    // 管理者デフォルト取得 - より詳細なログを追加
    console.log("Attempting to fetch admin_settings...");
    const { data: adminRows, error: adminError } = await supabaseClient
      .from('admin_settings')
      .select('setting_key, setting_value');

    console.log("Admin settings query error:", adminError);
    console.log("Admin settings data:", adminRows);

    // デバッグログの追加
    console.log("adminRows fetched (debug):", adminRows);

    const adminSettingMap: Record<string, any> = {};
    if (adminRows) {
      for (const row of adminRows) {
        adminSettingMap[row.setting_key] = row.setting_value;
      }
    }

    console.log("Processed adminSettingMap:", adminSettingMap);

    // --- APIキー・モデルどちらを使うか決定
    const { apiKeys, models, selectedProvider, usedFreeApi } = getApiConfig(settings, adminSettingMap, user.id);

    // 追加ログ
    console.log("apiKeys to be used", apiKeys, "selectedProvider", selectedProvider);

    // システムメッセージ用の設定オブジェクトを構築（管理者設定とユーザー設定を統合）
    const systemSettings = {
      ...settings,
      user_mbti: profile?.mbti,
      default_common_instruction: adminSettingMap['default_common_instruction'],
      default_subject_instructions: adminSettingMap['default_subject_instructions'],
      default_mbti_instructions: adminSettingMap['mbti_instructions']
    };

    // システムメッセージ
    const systemMessage = buildSystemMessage(systemSettings, subject);

    let aiResponse = "";
    let usedModel = "";
    let baseCost = 0;

    if (selectedProvider === "openai") {
      if (!apiKeys.openai) {
        console.error("OpenAI API key not configured (apiKeys)", apiKeys, "raw freeUserApiKeys", adminSettingMap['free_user_api_keys']);
        throw new Error("OpenAI API key not configured");
      }
      const messages = [];
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
      // 追加ログ
      console.log("OpenAI apiRequest", { model: model || models.openai, messages });
      const result = await requestOpenAI({
        apiKey: apiKeys.openai,
        model: model || models.openai,
        messages,
      });
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      baseCost = result.cost;
    }
    else if (selectedProvider === "anthropic") {
      if (!apiKeys.anthropic) {
        console.error("Anthropic API key not configured (apiKeys)", apiKeys, "raw freeUserApiKeys", adminSettingMap['free_user_api_keys']);
        throw new Error("Anthropic API key not configured");
      }
      console.log("Anthropic apiRequest", { model: model || models.anthropic, message });
      const result = await requestAnthropic({
        apiKey: apiKeys.anthropic,
        model: model || models.anthropic,
        systemMessage,
        conversationHistory,
        message,
      });
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      baseCost = result.cost;
    }
    else if (selectedProvider === "google") {
      if (!apiKeys.google) {
        console.error("Google Gemini API key not configured (apiKeys)", apiKeys, "raw freeUserApiKeys", adminSettingMap['free_user_api_keys']);
        throw new Error("Google Gemini API key not configured");
      }
      console.log("Google apiRequest", { model: model || models.google, message });
      const result = await requestGoogle({
        apiKey: apiKeys.google,
        model: model || models.google,
        systemMessage,
        conversationHistory,
        message,
      });
      aiResponse = result.aiResponse;
      usedModel = result.usedModel;
      baseCost = result.cost;
    }
    else {
      throw new Error("Unknown AI provider. Only openai, anthropic, google are supported.");
    }

    const displayCost = getDisplayCost({ usedFreeApi, baseCost });

    // 追加ログ
    console.log("AI Response", { aiResponse, usedModel, baseCost, displayCost });

    return new Response(JSON.stringify({
      response: aiResponse,
      cost: displayCost,
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
