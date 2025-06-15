
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
  const { user } = await supabase.auth.getUser(req.headers.get("authorization")?.replace("Bearer ", ""));
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  // super_admin限定
  const { data: adminData } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminData || adminData.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Permission denied" }), { status: 403, headers: corsHeaders });
  }

  const { user_id } = await req.json();
  if (!user_id) {
    return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: corsHeaders });
  }

  // 利用者自身の削除不可（念の為）
  if (user_id === user.id) {
    return new Response(JSON.stringify({ error: "Cannot delete yourself" }), { status: 400, headers: corsHeaders });
  }

  // プロファイル等もあれば削除
  await supabase.from("profiles").delete().eq("id", user_id);
  await supabase.from("settings").delete().eq("id", user_id);
  await supabase.from("admin_users").delete().eq("user_id", user_id);

  // 本体削除（authユーザー本体）
  const { error } = await supabase.auth.admin.deleteUser(user_id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
