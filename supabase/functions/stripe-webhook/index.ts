
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_API_KEY")!;

    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_API_KEY not found");
      return new Response("Stripe configuration missing", { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature");
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      // 本番環境ではwebhook endpointのsecretを使用して署名を検証
      // 開発環境では署名検証をスキップ
      if (Deno.env.get("DENO_DEPLOYMENT_ID")) {
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET not found");
          return new Response("Webhook secret missing", { status: 500 });
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {
          console.error("Missing metadata in session:", session.id);
          return new Response("Missing metadata", { status: 400 });
        }

        console.log(`Processing checkout completion for user ${userId}, plan ${planId}`);

        // プランと顧客IDを更新
        let points = 10; // デフォルトのフリープランポイント
        if (planId === 'premium_monthly') {
          points = 200;
        }
        // 買い切りプランはポイント付与なし（API自己設定のため）

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            plan: planId,
            stripe_customer_id: session.customer as string,
            points: points,
          })
          .eq('id', userId);

        if (updateError) {
          console.error("Error updating profile:", updateError);
          return new Response("Database update failed", { status: 500 });
        }

        console.log(`Successfully updated user ${userId} to plan ${planId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.billing_reason === 'subscription_cycle') {
          // 月次更新の場合のみポイントをリセット
          const customerId = invoice.customer as string;
          
          // 顧客IDからユーザーを特定
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profileError || !profile) {
            console.error("Error finding user by customer ID:", profileError);
            return new Response("User not found", { status: 404 });
          }

          // プレミアムプランのポイントをリセット
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ points: 200 })
            .eq('id', profile.id);

          if (updateError) {
            console.error("Error resetting points:", updateError);
            return new Response("Points update failed", { status: 500 });
          }

          console.log(`Successfully reset points for user ${profile.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
