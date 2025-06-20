
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 詳細ログ機能
const logStep = (step: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  try {
    logStep("=== WEBHOOK REQUEST RECEIVED ===");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_API_KEY")!;
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    logStep("Environment variables check", {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
      hasStripeKey: !!STRIPE_SECRET_KEY,
      hasWebhookSecret: !!STRIPE_WEBHOOK_SECRET
    });

    if (!STRIPE_SECRET_KEY) {
      logStep("ERROR: STRIPE_API_KEY not found");
      return new Response("Stripe configuration missing", { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    logStep("Signature check", { hasSignature: !!signature });
    
    if (!signature) {
      logStep("ERROR: No stripe signature");
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    logStep("Request body received", { bodyLength: body.length });

    let event: Stripe.Event;

    try {
      // 署名検証の改善
      if (STRIPE_WEBHOOK_SECRET) {
        logStep("Verifying webhook signature with secret");
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        logStep("Signature verification successful");
      } else {
        logStep("WARNING: No webhook secret found, parsing without verification");
        event = JSON.parse(body);
      }
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response("Invalid signature", { status: 400 });
    }

    logStep("Processing webhook event", { 
      eventType: event.type, 
      eventId: event.id,
      created: event.created 
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          customerId: session.customer,
          paymentStatus: session.payment_status,
          mode: session.mode,
          metadata: session.metadata
        });

        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {
          logStep("ERROR: Missing metadata", { userId, planId, metadata: session.metadata });
          return new Response("Missing metadata", { status: 400 });
        }

        logStep(`Processing checkout completion for user ${userId}, plan ${planId}`);

        // プロフィール更新前の状態を確認
        const { data: beforeProfile, error: beforeError } = await supabase
          .from('profiles')
          .select('plan, points, stripe_customer_id')
          .eq('id', userId)
          .single();

        if (beforeError) {
          logStep("ERROR: Failed to fetch profile before update", { error: beforeError });
        } else {
          logStep("Profile before update", beforeProfile);
        }

        // プランに応じたポイント設定
        let points = 10; // デフォルトのフリープランポイント
        if (planId === 'premium_monthly') {
          points = 200;
          logStep("Setting premium monthly points", { points });
        } else if (planId === 'one_time') {
          points = 0; // 買い切りプランはポイント付与なし（API自己設定のため）
          logStep("Setting one-time plan points", { points });
        }

        const updateData = {
          plan: planId,
          stripe_customer_id: session.customer as string,
          points: points,
        };

        logStep("Updating profile with data", updateData);

        const { error: updateError, data: updateResult } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          logStep("ERROR: Database update failed", { error: updateError });
          return new Response("Database update failed", { status: 500 });
        }

        logStep("Profile update successful", { updateResult });

        // 更新後の状態を確認
        const { data: afterProfile, error: afterError } = await supabase
          .from('profiles')
          .select('plan, points, stripe_customer_id')
          .eq('id', userId)
          .single();

        if (afterError) {
          logStep("ERROR: Failed to fetch profile after update", { error: afterError });
        } else {
          logStep("Profile after update", afterProfile);
        }

        logStep(`Successfully updated user ${userId} to plan ${planId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment succeeded", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          billingReason: invoice.billing_reason,
          amountPaid: invoice.amount_paid
        });
        
        if (invoice.billing_reason === 'subscription_cycle') {
          // 月次更新の場合のみポイントをリセット
          const customerId = invoice.customer as string;
          
          logStep("Processing subscription cycle billing", { customerId });
          
          // 顧客IDからユーザーを特定
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, plan, points')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profileError || !profile) {
            logStep("ERROR: User not found by customer ID", { error: profileError, customerId });
            return new Response("User not found", { status: 404 });
          }

          logStep("Found user for customer", { userId: profile.id, currentPlan: profile.plan, currentPoints: profile.points });

          // プレミアムプランのポイントをリセット
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ points: 200 })
            .eq('id', profile.id);

          if (updateError) {
            logStep("ERROR: Points reset failed", { error: updateError });
            return new Response("Points update failed", { status: 500 });
          }

          logStep(`Successfully reset points for user ${profile.id}`);
        } else {
          logStep("Invoice not for subscription cycle, skipping points reset");
        }
        break;
      }

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    logStep("=== WEBHOOK PROCESSING COMPLETED SUCCESSFULLY ===");
    return new Response("OK", { status: 200 });

  } catch (error) {
    logStep("CRITICAL ERROR in webhook processing", { 
      error: error.message, 
      stack: error.stack 
    });
    return new Response("Internal server error", { status: 500 });
  }
});
