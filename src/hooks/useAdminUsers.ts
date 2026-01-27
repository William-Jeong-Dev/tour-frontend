import { useQuery } from "@tanstack/react-query";
import {
    fetchAdminUsersSummary,
    getAdminUserProfile,
    listAdminUserBookings,
    listAdminUserFavorites,
    listAdminUsers,
} from "../api/adminUsers.api";

export function useAdminUsers(q: string, page: number, limit = 50) {
    const offset = (page - 1) * limit;
    return useQuery({
        queryKey: ["adminUsers", { q, page, limit }],
        queryFn: () => listAdminUsers({ q, limit, offset }),
        staleTime: 30_000,
    });
}

export function useAdminUsersSummary() {
    return useQuery({
        queryKey: ["adminUsersSummary"],
        queryFn: fetchAdminUsersSummary,
        staleTime: 30_000,
    });
}

export function useAdminUserProfile(userId: string) {
    return useQuery({
        queryKey: ["adminUserProfile", userId],
        queryFn: () => getAdminUserProfile(userId),
        enabled: Boolean(userId),
        staleTime: 30_000,
    });
}

export function useAdminUserBookings(userId: string) {
    return useQuery({
        queryKey: ["adminUserBookings", userId],
        queryFn: () => listAdminUserBookings(userId),
        enabled: Boolean(userId),
        staleTime: 30_000,
    });
}

export function useAdminUserFavorites(userId: string) {
    return useQuery({
        queryKey: ["adminUserFavorites", userId],
        queryFn: () => listAdminUserFavorites(userId),
        enabled: Boolean(userId),
        staleTime: 30_000,
    });
}
