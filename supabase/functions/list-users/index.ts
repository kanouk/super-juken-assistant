
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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // JWTチェック
  const { user } = await supabase.auth.getUser(req.headers.get("authorization")?.replace("Bearer ", ""));
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
  }

  // super_admin or admin チェック
  const { data: adminData } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminData || (adminData.role !== "super_admin" && adminData.role !== "admin")) {
    return new Response(JSON.stringify({ error: "Permission denied" }), { status: 403, headers: corsHeaders });
  }

  // users テーブル一覧取得
  const { data, error } = await supabase.auth.admin.listUsers({}); // supports pagination by default
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  // 必要情報だけ返却
  // user id, email, created_at, last_sign_in_at
  const users = data.users.map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    is_confirmed: u.confirmed_at !== null,
  }));

  return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
