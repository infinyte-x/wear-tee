/**
 * Pathao Courier API Client
 * 
 * API Documentation: https://merchant.pathao.com (Developers API section)
 * 
 * Features:
 * - OAuth token management
 * - Location data (cities, zones, areas)
 * - Store management
 * - Parcel creation and tracking
 * - Price calculation
 * - User success rate check
 */

import { supabase } from '@/integrations/supabase/client';

// Pathao API Base URLs
const PATHAO_BASE_URL = 'https://api-hermes.pathao.com';

// Types
export interface PathaoCredentials {
    client_id: string;
    client_secret: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
}

export interface PathaoCity {
    city_id: number;
    city_name: string;
}

export interface PathaoZone {
    zone_id: number;
    zone_name: string;
}

export interface PathaoArea {
    area_id: number;
    area_name: string;
}

export interface PathaoStore {
    store_id: number;
    store_name: string;
    store_address: string;
    city_id: number;
    zone_id: number;
    area_id: number;
    hub_id: number;
}

export interface PathaoParcelData {
    store_id: number;
    merchant_order_id: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    recipient_city: number;
    recipient_zone: number;
    recipient_area: number;
    delivery_type: number; // 48 = Normal
    item_type: number; // 2 = Parcel
    special_instruction?: string;
    item_quantity: number;
    item_weight: number;
    amount_to_collect: number; // COD amount (0 for prepaid)
    item_description?: string;
}

export interface PathaoParcelResponse {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
}

export interface PathaoUserSuccessRate {
    phone: string;
    success_rate: number;
    total_orders: number;
    successful_orders: number;
    failed_orders: number;
}

// Database type for courier_integrations (not in generated types yet)
interface CourierIntegration {
    id: string;
    courier_name: string;
    client_id: string | null;
    client_secret: string | null;
    access_token: string | null;
    refresh_token: string | null;
    token_expires_at: string | null;
    is_active: boolean;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// Helper: Get stored credentials from database
async function getStoredCredentials(): Promise<PathaoCredentials | null> {
    const { data, error } = await (supabase as any)
        .from('courier_integrations')
        .select('*')
        .eq('courier_name', 'pathao')
        .single();

    if (error || !data) return null;

    const integration = data as CourierIntegration;
    return {
        client_id: integration.client_id || '',
        client_secret: integration.client_secret || '',
        access_token: integration.access_token || undefined,
        refresh_token: integration.refresh_token || undefined,
        token_expires_at: integration.token_expires_at || undefined,
    };
}

// Helper: Save credentials to database
async function saveCredentials(credentials: Partial<PathaoCredentials>): Promise<void> {
    await (supabase as any)
        .from('courier_integrations')
        .upsert({
            courier_name: 'pathao',
            ...credentials,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'courier_name' });
}

// Helper: Check if token is expired
function isTokenExpired(expiresAt: string | undefined): boolean {
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
}

/**
 * Get access token (refreshes if expired)
 */
export async function getAccessToken(): Promise<string> {
    const credentials = await getStoredCredentials();

    if (!credentials?.client_id || !credentials?.client_secret) {
        throw new Error('Pathao credentials not configured. Please set up in Admin > Delivery Support.');
    }

    // Check if we have a valid token
    if (credentials.access_token && !isTokenExpired(credentials.token_expires_at)) {
        return credentials.access_token;
    }

    // Get new token
    const response = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            client_id: credentials.client_id,
            client_secret: credentials.client_secret,
            grant_type: 'client_credentials',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get Pathao access token');
    }

    const data = await response.json();

    // Calculate expiry (token is valid for ~1 hour, we refresh 5 mins before)
    const expiresAt = new Date(Date.now() + (data.expires_in - 300) * 1000).toISOString();

    // Save new token
    await saveCredentials({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: expiresAt,
    });

    return data.access_token;
}

/**
 * Make authenticated API request to Pathao
 */
async function pathaoRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: object
): Promise<T> {
    const token = await getAccessToken();

    const response = await fetch(`${PATHAO_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Pathao API error: ${response.status}`);
    }

    return response.json();
}

// ============ Location APIs ============

/**
 * Get all cities served by Pathao
 */
export async function getCities(): Promise<PathaoCity[]> {
    const response = await pathaoRequest<{ data: { data: PathaoCity[] } }>(
        '/aladdin/api/v1/countries/1/city-list'
    );
    return response.data.data;
}

/**
 * Get zones within a city
 */
export async function getZones(cityId: number): Promise<PathaoZone[]> {
    const response = await pathaoRequest<{ data: { data: PathaoZone[] } }>(
        `/aladdin/api/v1/cities/${cityId}/zone-list`
    );
    return response.data.data;
}

/**
 * Get areas within a zone
 */
export async function getAreas(zoneId: number): Promise<PathaoArea[]> {
    const response = await pathaoRequest<{ data: { data: PathaoArea[] } }>(
        `/aladdin/api/v1/zones/${zoneId}/area-list`
    );
    return response.data.data;
}

// ============ Store APIs ============

/**
 * Get merchant's pickup stores
 */
export async function getStores(): Promise<PathaoStore[]> {
    const response = await pathaoRequest<{ data: { data: PathaoStore[] } }>(
        '/aladdin/api/v1/stores'
    );
    return response.data.data;
}

/**
 * Create a new pickup store
 */
export async function createStore(storeData: {
    name: string;
    contact_name: string;
    contact_number: string;
    address: string;
    city_id: number;
    zone_id: number;
    area_id: number;
}): Promise<PathaoStore> {
    const response = await pathaoRequest<{ data: PathaoStore }>(
        '/aladdin/api/v1/stores',
        'POST',
        storeData
    );
    return response.data;
}

// ============ Parcel/Order APIs ============

/**
 * Create a new parcel (book delivery)
 */
export async function createParcel(parcelData: PathaoParcelData): Promise<PathaoParcelResponse> {
    const response = await pathaoRequest<{ data: PathaoParcelResponse }>(
        '/aladdin/api/v1/orders',
        'POST',
        parcelData
    );
    return response.data;
}

/**
 * Get parcel/order details by consignment ID
 */
export async function getParcelDetails(consignmentId: string): Promise<any> {
    const response = await pathaoRequest<{ data: any }>(
        `/aladdin/api/v1/orders/${consignmentId}`
    );
    return response.data;
}

/**
 * Calculate delivery price
 */
export async function calculatePrice(data: {
    store_id: number;
    item_type: number;
    delivery_type: number;
    item_weight: number;
    recipient_city: number;
    recipient_zone: number;
}): Promise<{ price: number; discount: number; promo_discount: number }> {
    const response = await pathaoRequest<{ data: any }>(
        '/aladdin/api/v1/merchant/price-plan',
        'POST',
        data
    );
    return response.data;
}

// ============ User APIs ============

/**
 * Get user success rate by phone number
 * Useful for fraud prevention on COD orders
 */
export async function getUserSuccessRate(phone: string): Promise<PathaoUserSuccessRate> {
    const response = await pathaoRequest<{ data: { data: PathaoUserSuccessRate } }>(
        '/aladdin/api/v1/user/success',
        'POST',
        { phone }
    );
    return response.data.data;
}

// ============ Connection Test ============

/**
 * Test Pathao connection with provided credentials
 */
export async function testConnection(clientId: string, clientSecret: string): Promise<boolean> {
    try {
        const response = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
            }),
        });

        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Save Pathao credentials and activate integration
 */
export async function connectPathao(clientId: string, clientSecret: string): Promise<void> {
    // Test credentials first
    const isValid = await testConnection(clientId, clientSecret);
    if (!isValid) {
        throw new Error('Invalid credentials. Please check your Client ID and Client Secret.');
    }

    // Save to database
    await (supabase as any)
        .from('courier_integrations')
        .upsert({
            courier_name: 'pathao',
            client_id: clientId,
            client_secret: clientSecret,
            is_active: true,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'courier_name' });
}

/**
 * Disconnect Pathao integration
 */
export async function disconnectPathao(): Promise<void> {
    await (supabase as any)
        .from('courier_integrations')
        .update({
            is_active: false,
            access_token: null,
            refresh_token: null,
            token_expires_at: null,
        })
        .eq('courier_name', 'pathao');
}

/**
 * Check if Pathao is connected
 */
export async function isPathaoConnected(): Promise<boolean> {
    const { data } = await (supabase as any)
        .from('courier_integrations')
        .select('is_active')
        .eq('courier_name', 'pathao')
        .single();

    return data?.is_active ?? false;
}
