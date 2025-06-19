
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// グローバルなSupabaseクライアントを作成
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// 管理者設定からOpenAI APIキーを取得する関数
async function getAdminOpenAIKey(): Promise<string | null> {
  try {
    console.log('🔑 Fetching admin OpenAI API key from settings...');
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'free_user_api_keys')
      .single();

    if (error) {
      console.error('❌ Failed to fetch admin API keys:', error);
      return null;
    }

    const apiKeys = data?.setting_value as Record<string, string>;
    const openaiKey = apiKeys?.openai;
    
    if (!openaiKey) {
      console.error('❌ OpenAI API key not found in admin settings');
      return null;
    }

    console.log('✅ Admin OpenAI API key retrieved successfully');
    return openaiKey;
  } catch (error) {
    console.error('❌ Error fetching admin OpenAI API key:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, conversationContent, subject } = await req.json();
    
    console.log('=== AUTO-TAGGING REQUEST START ===');
    console.log('Conversation ID:', conversationId);
    console.log('Input Subject:', subject);
    console.log('Has Question:', !!conversationContent?.question);
    console.log('Has Answer:', !!conversationContent?.answer);
    console.log('Question length:', conversationContent?.question?.length || 0);
    console.log('Answer length:', conversationContent?.answer?.length || 0);
    
    if (!conversationId || !conversationContent?.question) {
      console.error('❌ Missing required parameters:', { 
        conversationId: !!conversationId, 
        question: !!conversationContent?.question 
      });
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: conversationId and question are required',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 教科が指定されていない場合は、質問内容から判定
    let determinedSubject = subject;
    if (!subject || subject === 'other') {
      console.log('🔍 Determining subject from conversation content...');
      determinedSubject = await determineSubject(conversationContent.question);
      console.log('✅ Determined subject:', determinedSubject);
    } else {
      // 英語の教科名を日本語にマッピング
      const subjectMapping: Record<string, string> = {
        'math': '数学',
        'chemistry': '化学',
        'biology': '生物',
        'physics': '物理',
        'english': '英語',
        'japanese': '国語',
        'geography': '地理',
        'history': '日本史',
        'world_history': '世界史',
        'earth_science': '地学',
        'information': '情報',
        'other': 'その他'
      };
      
      if (subjectMapping[subject]) {
        determinedSubject = subjectMapping[subject];
        console.log('🔄 Mapped subject from', subject, 'to', determinedSubject);
      }
    }

    // 該当教科のタグ一覧を取得
    console.log('📚 Fetching tags for subject:', determinedSubject);
    const { data: tags, error: tagsError } = await supabase
      .from('tag_master')
      .select('id, major_category, minor_category')
      .eq('subject', determinedSubject);

    if (tagsError) {
      console.error('❌ Failed to fetch tags:', tagsError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch tags', 
        details: tagsError,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📊 Found ${tags?.length || 0} tags for subject: ${determinedSubject}`);
    
    if (!tags || tags.length === 0) {
      console.log('⚠️ No tags found for subject:', determinedSubject);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No tags available for this subject', 
        subject: determinedSubject,
        tagsCount: 0,
        availableTags: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LLMにタグ選択を依頼（質問+回答を使用）
    console.log('🤖 Requesting tag selection from LLM...');
    const selectedTags = await selectTagsWithLLM(conversationContent, determinedSubject, tags);
    console.log('✅ LLM selected tags:', selectedTags?.length || 0);
    
    if (selectedTags && selectedTags.length > 0) {
      console.log('📝 Selected tag details:', selectedTags.map(t => `${t.major_category} > ${t.minor_category}`));
    }

    // 選択されたタグを質問に関連付け
    if (selectedTags && selectedTags.length > 0) {
      // 既存のタグを確認（重複挿入を防ぐ）
      console.log('🔍 Checking for existing tags...');
      const { data: existingTags } = await supabase
        .from('question_tags')
        .select('tag_id')
        .eq('conversation_id', conversationId);

      const existingTagIds = new Set(existingTags?.map(t => t.tag_id) || []);
      const newTags = selectedTags.filter(tag => !existingTagIds.has(tag.id));

      console.log(`📊 Existing tags: ${existingTagIds.size}, New tags to insert: ${newTags.length}`);

      if (newTags.length > 0) {
        const insertData = newTags.map(tag => ({
          conversation_id: conversationId,
          tag_id: tag.id,
          assignment_method: 'auto'
        }));

        console.log('💾 Inserting new tags:', insertData);
        const { error: insertError } = await supabase
          .from('question_tags')
          .insert(insertData);

        if (insertError) {
          console.error('❌ Failed to insert question tags:', insertError);
          return new Response(JSON.stringify({ 
            error: 'Failed to save tags', 
            details: insertError,
            success: false 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`✅ Successfully inserted ${newTags.length} new tags`);
      } else {
        console.log('ℹ️ All selected tags already exist for this conversation');
      }
    } else {
      console.log('⚠️ No tags were selected by LLM');
    }

    console.log('=== AUTO-TAGGING REQUEST END ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      subject: determinedSubject, 
      tagsCount: selectedTags?.length || 0,
      message: 'Auto-tagging completed successfully',
      availableTags: tags?.length || 0,
      selectedTags: selectedTags?.map(t => ({ major: t.major_category, minor: t.minor_category })) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR in auto-tag-question function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function determineSubject(questionContent: string): Promise<string> {
  const openAIApiKey = await getAdminOpenAIKey();
  console.log('🔑 Admin OpenAI API Key status:', openAIApiKey ? 'Available' : 'Missing');
  
  if (!openAIApiKey) {
    console.error('❌ Admin OpenAI API key not found');
    return 'その他';
  }

  try {
    console.log('🤖 Calling OpenAI for subject determination...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `以下の質問内容を分析し、最も適切な教科を1つ選択してください。

選択可能な教科：
- 国語
- 数学
- 英語
- 物理
- 化学
- 生物
- 地学
- 世界史
- 日本史
- 地理
- 情報

教科名のみを回答してください。判定が困難な場合は「その他」と回答してください。`
          },
          {
            role: 'user',
            content: questionContent
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      }),
    });

    console.log('📡 OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const subject = data.choices[0].message.content.trim();
    console.log('✅ OpenAI determined subject:', subject);
    
    const validSubjects = ['国語', '数学', '英語', '物理', '化学', '生物', '地学', '世界史', '日本史', '地理', '情報'];
    const result = validSubjects.includes(subject) ? subject : 'その他';
    console.log('📚 Final subject result:', result);
    
    return result;

  } catch (error) {
    console.error('❌ Error determining subject:', error);
    return 'その他';
  }
}

async function selectTagsWithLLM(conversationContent: any, subject: string, availableTags: any[]): Promise<any[]> {
  const openAIApiKey = await getAdminOpenAIKey();
  if (!openAIApiKey) {
    console.error('❌ Admin OpenAI API key not found for tag selection');
    return [];
  }

  // タグ一覧を番号付きで明確に表示
  const tagsList = availableTags.map((tag, index) => 
    `${index + 1}. "${tag.major_category} > ${tag.minor_category}" (ID: ${tag.id})`
  ).join('\n');

  // 質問と回答を組み合わせた分析用テキストを作成
  const analysisText = conversationContent.answer 
    ? `【質問】\n${conversationContent.question}\n\n【回答】\n${conversationContent.answer}`
    : `【質問】\n${conversationContent.question}`;

  console.log('🏷️ Available tags count:', availableTags.length);
  console.log('📝 Analysis text length:', analysisText.length);

  try {
    console.log('🤖 Calling OpenAI for tag selection...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `以下の受験生の質問と回答内容を分析し、提供されたタグ一覧の中から最も適切なものを選択してください。

【重要な指示】
- 必ず下記の「選択可能なタグ一覧」の中からのみ選択してください
- 一覧にないタグは絶対に選択しないでください
- 質問内容と回答内容の両方を参考にして、最も適したタグを1〜3個選択してください
- 以下のJSON形式で回答してください：
{"selected_tags": [{"major": "大分類名", "minor": "中分類名"}, ...]}
- JSON以外の文字は含めないでください
- 該当するタグがない場合は空の配列を返してください`
          },
          {
            role: 'user',
            content: `${analysisText}

【対象教科】
${subject}

【選択可能なタグ一覧】
以下のタグの中からのみ選択してください：
${tagsList}

上記のタグ一覧の中で、質問と回答の内容に最も関連するものを選択してください。`
          }
        ],
        temperature: 0.1,
        max_tokens: 300
      }),
    });

    console.log('📡 OpenAI tag selection response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error for tag selection: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content.trim();
    
    console.log('🤖 LLM raw response:', responseText);
    
    // JSON解析
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse LLM response as JSON:', parseError);
      console.error('Raw response was:', responseText);
      return [];
    }
    
    const selectedTags = parsed.selected_tags || [];
    console.log('🏷️ Parsed selected tags:', selectedTags);

    // 選択されたタグが実際に存在するかチェック
    const validTags = selectedTags
      .map((selectedTag: any) => {
        const foundTag = availableTags.find(tag => 
          tag.major_category === selectedTag.major && 
          tag.minor_category === selectedTag.minor
        );
        if (!foundTag) {
          console.warn(`⚠️ Tag not found: ${selectedTag.major} > ${selectedTag.minor}`);
        }
        return foundTag;
      })
      .filter(Boolean);

    console.log(`✅ Validated ${validTags.length} out of ${selectedTags.length} selected tags`);
    return validTags;

  } catch (error) {
    console.error('❌ Error selecting tags with LLM:', error);
    return [];
  }
}
