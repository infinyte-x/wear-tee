/**
 * usePathao Hook
 * 
 * React hook for Pathao courier operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    isPathaoConnected,
    getCities,
    getZones,
    getAreas,
    getStores,
    createParcel,
    getParcelDetails,
    calculatePrice,
    getUserSuccessRate,
    type PathaoCity,
    type PathaoZone,
    type PathaoArea,
    type PathaoStore,
    type PathaoParcelData,
} from '@/lib/pathao';
import { supabase } from '@/integrations/supabase/client';

// Check if Pathao is connected
export function usePathaoConnection() {
    return useQuery({
        queryKey: ['pathao-connection'],
        queryFn: isPathaoConnected,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Get Pathao cities
export function usePathaoCities() {
    const { data: isConnected } = usePathaoConnection();

    return useQuery({
        queryKey: ['pathao-cities'],
        queryFn: getCities,
        enabled: isConnected === true,
        staleTime: 1000 * 60 * 60, // 1 hour (cities don't change often)
    });
}

// Get Pathao zones for a city
export function usePathaoZones(cityId: number | null) {
    const { data: isConnected } = usePathaoConnection();

    return useQuery({
        queryKey: ['pathao-zones', cityId],
        queryFn: () => getZones(cityId!),
        enabled: isConnected === true && cityId !== null,
        staleTime: 1000 * 60 * 60,
    });
}

// Get Pathao areas for a zone
export function usePathaoAreas(zoneId: number | null) {
    const { data: isConnected } = usePathaoConnection();

    return useQuery({
        queryKey: ['pathao-areas', zoneId],
        queryFn: () => getAreas(zoneId!),
        enabled: isConnected === true && zoneId !== null,
        staleTime: 1000 * 60 * 60,
    });
}

// Get merchant's pickup stores
export function usePathaoStores() {
    const { data: isConnected } = usePathaoConnection();

    return useQuery({
        queryKey: ['pathao-stores'],
        queryFn: getStores,
        enabled: isConnected === true,
    });
}

// Book parcel with Pathao
export function useBookPathaoParcel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            orderId,
            parcelData,
        }: {
            orderId: string;
            parcelData: PathaoParcelData;
        }) => {
            // Create parcel with Pathao
            const result = await createParcel(parcelData);

            // Update order with Pathao consignment ID
            const { error } = await supabase
                .from('orders')
                .update({
                    tracking_number: result.consignment_id,
                    carrier: 'Pathao',
                    shipped_at: new Date().toISOString(),
                    status: 'shipped',
                    pathao_consignment_id: result.consignment_id,
                })
                .eq('id', orderId);

            if (error) throw error;

            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success(`Parcel booked! Consignment ID: ${data.consignment_id}`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to book parcel: ${error.message}`);
        },
    });
}

// Get parcel tracking details
export function usePathaoTracking(consignmentId: string | null) {
    return useQuery({
        queryKey: ['pathao-tracking', consignmentId],
        queryFn: () => getParcelDetails(consignmentId!),
        enabled: consignmentId !== null && consignmentId !== '',
        refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    });
}

// Calculate delivery price
export function usePathaoPrice() {
    return useMutation({
        mutationFn: calculatePrice,
    });
}

// Check user success rate (for fraud prevention)
export function usePathaoUserSuccessRate() {
    return useMutation({
        mutationFn: getUserSuccessRate,
        onSuccess: (data) => {
            if (data.success_rate < 50) {
                toast.warning(`Customer has low success rate: ${data.success_rate}%`);
            }
        },
    });
}

// Helper: Map Bangladesh division/district to Pathao city/zone
export function usePathaoLocationMapping() {
    const { data: cities } = usePathaoCities();

    const findCityByName = (name: string): PathaoCity | undefined => {
        if (!cities) return undefined;
        return cities.find(
            (city) => city.city_name.toLowerCase() === name.toLowerCase()
        );
    };

    return { cities, findCityByName };
}
