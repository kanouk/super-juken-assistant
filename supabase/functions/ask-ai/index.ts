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

    if (!settings?.api_keys?.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // 新しい: subject_configs から教科ごとのinstructionを探して利用する
    let systemMessage = settings.common_instruction || 'あなたは大学受験生の学習をサポートするAIアシスタントです。わかりやすく丁寧に説明してください。数学や化学の問題ではLaTeX記法を使って数式を表現してください。LaTeX記法を使用する際は、インライン数式は$...$、ブロック数式は$$...$$で囲んでください。';
    
    let customInstruction = '';
    // subject_configs（配列）から取得
    if (Array.isArray(settings.subject_configs)) {
      const foundConfig = settings.subject_configs.find((conf: any) => conf.id === subject);
      if (foundConfig && foundConfig.instruction && foundConfig.instruction.length > 0) {
        customInstruction = foundConfig.instruction;
      }
    }
    // フォールバック → subject_instructions（連想配列）
    if (!customInstruction && settings.subject_instructions && settings.subject_instructions[subject]) {
      customInstruction = settings.subject_instructions[subject];
    }
    if (customInstruction) {
      systemMessage += '\n\n' + customInstruction;
    }

    // Prepare messages for OpenAI with conversation history
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const historyMessage of recentHistory) {
        messages.push({
          role: historyMessage.role,
          content: historyMessage.content
        });
      }
    }

    // Add current message
    messages.push({ 
      role: 'user', 
      content: imageUrl 
        ? [
            { type: 'text', text: message },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        : message 
    });

    // Use the model passed from frontend, fallback to settings or default
    // モデル名を小文字に正規化
    let selectedModel = model || settings.models?.openai || 'gpt-4o';
    selectedModel = selectedModel.toLowerCase();
    
    // 正しいOpenAIモデル名にマッピング
    const modelMapping: { [key: string]: string } = {
      'gpt-4.1-2025-04-14': 'gpt-4.1-2025-04-14',
      'o3-2025-04-16': 'o3-2025-04-16',
      'o4-mini-2025-04-16': 'o4-mini-2025-04-16',
      'gpt-4o': 'gpt-4o',
      'gpt-4': 'gpt-4',
      'gpt-4-turbo': 'gpt-4-turbo'
    };
    
    selectedModel = modelMapping[selectedModel] || 'gpt-4o';
    console.log('Sending request to OpenAI with model:', selectedModel);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.api_keys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
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
    const aiResponse = data.choices[0].message.content;

    // Calculate cost (approximate)
    const inputTokens = JSON.stringify(messages).length / 4; // rough estimation
    const outputTokens = aiResponse.length / 4;
    const cost = (inputTokens * 0.00001) + (outputTokens * 0.00003); // GPT-4o pricing

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      cost: cost,
      model: selectedModel
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
