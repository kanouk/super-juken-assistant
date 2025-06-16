
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, questionContent, subject } = await req.json();
    
    if (!conversationId || !questionContent) {
      throw new Error('Missing required parameters');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 教科が指定されていない場合は、質問内容から判定
    let determinedSubject = subject;
    if (!subject) {
      determinedSubject = await determineSubject(questionContent);
    }

    // 該当教科のタグ一覧を取得
    const { data: tags, error: tagsError } = await supabase
      .from('tag_master')
      .select('id, major_category, minor_category')
      .eq('subject', determinedSubject);

    if (tagsError) {
      console.error('Failed to fetch tags:', tagsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch tags' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tags || tags.length === 0) {
      console.log(`No tags found for subject: ${determinedSubject}`);
      return new Response(JSON.stringify({ success: true, message: 'No tags available for this subject' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LLMにタグ選択を依頼
    const selectedTags = await selectTagsWithLLM(questionContent, determinedSubject, tags);

    // 選択されたタグを質問に関連付け
    if (selectedTags && selectedTags.length > 0) {
      const insertData = selectedTags.map(tag => ({
        conversation_id: conversationId,
        tag_id: tag.id,
        assignment_method: 'auto'
      }));

      const { error: insertError } = await supabase
        .from('question_tags')
        .insert(insertData);

      if (insertError) {
        console.error('Failed to insert question tags:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to save tags' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      subject: determinedSubject, 
      tagsCount: selectedTags?.length || 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto-tag-question function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function determineSubject(questionContent: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return 'その他';
  }

  try {
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const subject = data.choices[0].message.content.trim();
    
    const validSubjects = ['国語', '数学', '英語', '物理', '化学', '生物', '地学', '世界史', '日本史', '地理', '情報'];
    return validSubjects.includes(subject) ? subject : 'その他';

  } catch (error) {
    console.error('Error determining subject:', error);
    return 'その他';
  }
}

async function selectTagsWithLLM(questionContent: string, subject: string, availableTags: any[]): Promise<any[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return [];
  }

  const tagsList = availableTags.map(tag => 
    `"${tag.major_category} > ${tag.minor_category}"`
  ).join('\n');

  try {
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
            content: `以下の受験生の質問内容を分析し、適切な分野タグを選択してください。

【指示】
- 質問内容に最も適したタグを1〜3個選択してください
- 以下のJSON形式で回答してください：
{"selected_tags": [{"major": "大分類名", "minor": "中分類名"}, ...]}
- JSON以外の文字は含めないでください`
          },
          {
            role: 'user',
            content: `【質問内容】
${questionContent}

【対象教科】
${subject}

【選択可能なタグ一覧】
${tagsList}`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content.trim();
    
    // JSON解析
    const parsed = JSON.parse(responseText);
    const selectedTags = parsed.selected_tags || [];

    // 選択されたタグが実際に存在するかチェック
    const validTags = selectedTags
      .map((selectedTag: any) => {
        const foundTag = availableTags.find(tag => 
          tag.major_category === selectedTag.major && 
          tag.minor_category === selectedTag.minor
        );
        return foundTag;
      })
      .filter(Boolean);

    return validTags;

  } catch (error) {
    console.error('Error selecting tags with LLM:', error);
    return [];
  }
}
