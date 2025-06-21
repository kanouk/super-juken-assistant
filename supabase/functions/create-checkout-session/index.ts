
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_API_KEY")!;

    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_API_KEY not found in environment variables");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // リクエストボディから planId を取得
    const { planId } = await req.json();
    
    if (!planId || !['one_time', 'premium_monthly'].includes(planId)) {
      return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // 既存のStripe顧客を検索
    const customers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // 新しい顧客を作成
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // プランに応じた設定
    let lineItems;
    let mode: 'payment' | 'subscription';

    if (planId === 'one_time') {
      mode = 'payment';
      lineItems = [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '買い切りプラン',
              description: 'API自己設定プラン',
            },
            unit_amount: 1980, // 1980円
          },
          quantity: 1,
        },
      ];
    } else {
      mode = 'subscription';
      lineItems = [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'プレミアムプラン（月額）',
              description: '毎月200ポイント付与、全機能解放',
            },
            unit_amount: 2980, // 2980円
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    // Checkout Sessionを作成（新しいリダイレクト先を使用）
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    console.log("Created checkout session:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
