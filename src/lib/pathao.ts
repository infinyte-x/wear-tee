/**
 * Pathao Courier API Client
 * 
 * This module calls Pathao API through a Supabase Edge Function
 * to avoid CORS issues in the browser.
 * 
 * API Documentation: https://merchant.pathao.com (Developers API section)
 */

import { supabase } from '@/integrations/supabase/client';

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

/**
 * Call Pathao API through Edge Function
 */
async function callPathaoProxy<T>(action: string, params: Record<string, any> = {}): Promise<T> {
    const { data, error } = await supabase.functions.invoke('pathao-proxy', {
        body: { action, ...params },
    });

    if (error) {
        throw new Error(error.message);
    }

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

// ============ Connection APIs ============

/**
 * Test Pathao connection with provided credentials
 */
export async function testConnection(clientId: string, clientSecret: string): Promise<boolean> {
    try {
        const result = await callPathaoProxy<{ success: boolean }>('test-connection', {
            client_id: clientId,
            client_secret: clientSecret,
        });
        return result.success;
    } catch {
        return false;
    }
}

/**
 * Save Pathao credentials and activate integration
 */
export async function connectPathao(clientId: string, clientSecret: string): Promise<void> {
    const result = await callPathaoProxy<{ success?: boolean; error?: string }>('connect', {
        client_id: clientId,
        client_secret: clientSecret,
    });

    if (!result.success) {
        throw new Error(result.error || 'Failed to connect');
    }
}

/**
 * Disconnect Pathao integration
 */
export async function disconnectPathao(): Promise<void> {
    await callPathaoProxy('disconnect');
}

/**
 * Check if Pathao is connected
 */
export async function isPathaoConnected(): Promise<boolean> {
    try {
        const result = await callPathaoProxy<{ connected: boolean }>('check-connection');
        return result.connected;
    } catch {
        return false;
    }
}

// ============ Location APIs ============

/**
 * Get all cities served by Pathao
 */
export async function getCities(): Promise<PathaoCity[]> {
    const response = await callPathaoProxy<{ data: { data: PathaoCity[] } }>('get-cities');
    return response.data.data;
}

/**
 * Get zones within a city
 */
export async function getZones(cityId: number): Promise<PathaoZone[]> {
    const response = await callPathaoProxy<{ data: { data: PathaoZone[] } }>('get-zones', {
        city_id: cityId,
    });
    return response.data.data;
}

/**
 * Get areas within a zone
 */
export async function getAreas(zoneId: number): Promise<PathaoArea[]> {
    const response = await callPathaoProxy<{ data: { data: PathaoArea[] } }>('get-areas', {
        zone_id: zoneId,
    });
    return response.data.data;
}

// ============ Store APIs ============

/**
 * Get merchant's pickup stores
 */
export async function getStores(): Promise<PathaoStore[]> {
    const response = await callPathaoProxy<{ data: { data: PathaoStore[] } }>('get-stores');
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
    const response = await callPathaoProxy<{ data: PathaoStore }>('create-store', {
        store_data: storeData,
    });
    return response.data;
}

// ============ Parcel/Order APIs ============

/**
 * Create a new parcel (book delivery)
 */
export async function createParcel(parcelData: PathaoParcelData): Promise<PathaoParcelResponse> {
    const response = await callPathaoProxy<{ data: PathaoParcelResponse }>('create-parcel', {
        parcel_data: parcelData,
    });
    return response.data;
}

/**
 * Get parcel/order details by consignment ID
 */
export async function getParcelDetails(consignmentId: string): Promise<any> {
    const response = await callPathaoProxy<{ data: any }>('get-parcel', {
        consignment_id: consignmentId,
    });
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
    const response = await callPathaoProxy<{ data: any }>('calculate-price', {
        price_data: data,
    });
    return response.data;
}

// ============ User APIs ============

/**
 * Get user success rate by phone number
 * Useful for fraud prevention on COD orders
 */
export async function getUserSuccessRate(phone: string): Promise<PathaoUserSuccessRate> {
    const response = await callPathaoProxy<{ data: { data: PathaoUserSuccessRate } }>('user-success-rate', {
        phone,
    });
    return response.data.data;
}
