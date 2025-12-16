// Supabase Edge Function to proxy Pathao API calls
// This avoids CORS issues by making server-side requests

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PATHAO_BASE_URL = "https://api-hermes.pathao.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface PathaoTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { action, ...params } = await req.json();

        // Get stored credentials
        const { data: credentials } = await supabase
            .from("courier_integrations")
            .select("*")
            .eq("courier_name", "pathao")
            .single();

        // Actions that don't require stored credentials
        if (action === "test-connection") {
            const { client_id, client_secret } = params;
            const response = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    client_id,
                    client_secret,
                    grant_type: "client_credentials",
                }),
            });

            return new Response(
                JSON.stringify({ success: response.ok }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (action === "connect") {
            const { client_id, client_secret } = params;

            // Test credentials first
            const testResponse = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    client_id,
                    client_secret,
                    grant_type: "client_credentials",
                }),
            });

            if (!testResponse.ok) {
                return new Response(
                    JSON.stringify({ error: "Invalid credentials" }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            const tokenData: PathaoTokenResponse = await testResponse.json();
            const expiresAt = new Date(Date.now() + (tokenData.expires_in - 300) * 1000).toISOString();

            // Save credentials
            await supabase
                .from("courier_integrations")
                .upsert({
                    courier_name: "pathao",
                    client_id,
                    client_secret,
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    token_expires_at: expiresAt,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "courier_name" });

            return new Response(
                JSON.stringify({ success: true }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // For all other actions, we need stored credentials
        if (!credentials?.client_id || !credentials?.client_secret) {
            return new Response(
                JSON.stringify({ error: "Pathao not configured" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get access token (refresh if expired)
        let accessToken = credentials.access_token;
        const tokenExpired = !credentials.token_expires_at ||
            new Date(credentials.token_expires_at) <= new Date();

        if (tokenExpired) {
            const tokenResponse = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    grant_type: "client_credentials",
                }),
            });

            if (!tokenResponse.ok) {
                return new Response(
                    JSON.stringify({ error: "Failed to get access token" }),
                    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            const tokenData: PathaoTokenResponse = await tokenResponse.json();
            accessToken = tokenData.access_token;
            const expiresAt = new Date(Date.now() + (tokenData.expires_in - 300) * 1000).toISOString();

            // Update stored token
            await supabase
                .from("courier_integrations")
                .update({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    token_expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                })
                .eq("courier_name", "pathao");
        }

        // Handle different API actions
        let endpoint = "";
        let method = "GET";
        let body = undefined;

        switch (action) {
            case "get-cities":
                endpoint = "/aladdin/api/v1/countries/1/city-list";
                break;
            case "get-zones":
                endpoint = `/aladdin/api/v1/cities/${params.city_id}/zone-list`;
                break;
            case "get-areas":
                endpoint = `/aladdin/api/v1/zones/${params.zone_id}/area-list`;
                break;
            case "get-stores":
                endpoint = "/aladdin/api/v1/stores";
                break;
            case "create-store":
                endpoint = "/aladdin/api/v1/stores";
                method = "POST";
                body = JSON.stringify(params.store_data);
                break;
            case "create-parcel":
                endpoint = "/aladdin/api/v1/orders";
                method = "POST";
                body = JSON.stringify(params.parcel_data);
                break;
            case "get-parcel":
                endpoint = `/aladdin/api/v1/orders/${params.consignment_id}`;
                break;
            case "calculate-price":
                endpoint = "/aladdin/api/v1/merchant/price-plan";
                method = "POST";
                body = JSON.stringify(params.price_data);
                break;
            case "user-success-rate":
                endpoint = "/aladdin/api/v1/user/success";
                method = "POST";
                body = JSON.stringify({ phone: params.phone });
                break;
            case "check-connection":
                return new Response(
                    JSON.stringify({ connected: credentials.is_active }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            case "disconnect":
                await supabase
                    .from("courier_integrations")
                    .update({
                        is_active: false,
                        access_token: null,
                        refresh_token: null,
                        token_expires_at: null,
                    })
                    .eq("courier_name", "pathao");
                return new Response(
                    JSON.stringify({ success: true }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            default:
                return new Response(
                    JSON.stringify({ error: `Unknown action: ${action}` }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
        }

        // Make the Pathao API request
        const pathaoResponse = await fetch(`${PATHAO_BASE_URL}${endpoint}`, {
            method,
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body,
        });

        const data = await pathaoResponse.json();

        return new Response(
            JSON.stringify(data),
            {
                status: pathaoResponse.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
