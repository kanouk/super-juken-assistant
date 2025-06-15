
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const errorData = await response.text();
      return { valid: false, error: `OpenAI API Error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: `Network error: ${error.message}` };
  }
}

async function verifyGoogle(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const errorData = await response.text();
      return { valid: false, error: `Google API Error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: `Network error: ${error.message}` };
  }
}

async function verifyAnthropic(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      })
    });

    if (response.ok || response.status === 400) { // 400 is expected for minimal test request
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `Anthropic API Error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: `Network error: ${error.message}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Provider and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    switch (provider) {
      case 'openai':
        result = await verifyOpenAI(apiKey);
        break;
      case 'google':
        result = await verifyGoogle(apiKey);
        break;
      case 'anthropic':
        result = await verifyAnthropic(apiKey);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-api-key function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
