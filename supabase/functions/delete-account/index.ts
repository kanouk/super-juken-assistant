
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // JWTチェック
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Authorization header required" }), { status: 401, headers: corsHeaders });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  const userId = user.id;

  try {
    // ユーザーに関連するすべてのデータを削除
    // 1. メッセージを削除（会話経由で削除される）
    // 2. 会話を削除
    await supabase.from("conversations").delete().eq("user_id", userId);
    
    // 3. 設定を削除
    await supabase.from("settings").delete().eq("id", userId);
    
    // 4. プロファイルを削除（cascade削除により関連データも削除される）
    await supabase.from("profiles").delete().eq("id", userId);
    
    // 5. 管理者権限があれば削除
    await supabase.from("admin_users").delete().eq("user_id", userId);

    // 6. 最後にauth.usersから削除
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete user from auth:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete account" }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Account deletion error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete account" }), { status: 500, headers: corsHeaders });
  }
});
