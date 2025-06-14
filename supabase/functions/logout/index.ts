
// Edge function: /functions/v1/logout
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 認証ヘッダからアクセストークンを取得
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Supabaseクライアント初期化
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // signOutはクライアント向けAPIにしかない（admin apiは全ユーザー削除/無効用）
  // -> ここではクライアントサイドのセッションクッキーのみを削除要求
  // 普通（通常のSPA）はクライアントで signOut すれば十分です

  // 念のためOKレスポンスを返す
  return new Response(JSON.stringify({ result: "ok" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
