
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

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // JWTチェック
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "No authorization header" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Not authenticated" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log("Authenticated user:", user.id);

    // super_admin or admin チェック
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminData || (adminData.role !== "super_admin" && adminData.role !== "admin")) {
      console.error("Permission denied for user:", user.id, "Admin data:", adminData, "Error:", adminError);
      return new Response(JSON.stringify({ error: "Permission denied" }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log("User has admin permissions:", adminData.role);

    // users テーブル一覧取得
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("Error listing users:", error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // プロフィール情報をまとめて取得
    const userIds = authUsers.users.map((u: any) => u.id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, plan, points')
      .in('id', userIds);

    console.log("Fetched profiles data:", profiles);

    // プロフィールデータをIDでマップ化
    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });
    }

    // ユーザー情報とプロフィール情報を結合
    const users = authUsers.users.map((u: any) => {
      const profile = profilesMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        is_confirmed: u.email_confirmed_at !== null,
        plan: profile?.plan || 'free',
        points: profile?.points || 0,
      };
    });

    console.log("Successfully fetched users with plan info:", users.length);

    return new Response(JSON.stringify({ users }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
