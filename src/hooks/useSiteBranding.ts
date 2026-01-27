import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPublicSiteAssetUrl, getSiteSetting, upsertSiteSetting, uploadSiteLogo } from "../api/siteSettings.api";

export function useLogoUrl() {
    return useQuery({
        queryKey: ["siteSetting", "logo_path"],
        queryFn: async () => {
            const path = await getSiteSetting("logo_path");
            return getPublicSiteAssetUrl(path);
        },
        staleTime: 60_000,
    });
}

export function usePrimaryColor() {
    return useQuery({
        queryKey: ["siteSetting", "primary_color"],
        queryFn: async () => {
            const v = await getSiteSetting("primary_color");
            return (v || "").trim();
        },
        staleTime: 60_000,
    });
}

export function useUpdatePrimaryColor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (color: string) => upsertSiteSetting("primary_color", color),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", "primary_color"] });
        },
    });
}

export function useUpdateLogoPath() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (path: string) => upsertSiteSetting("logo_path", path),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", "logo_path"] });
        },
    });
}

export function useUploadLogoAndSave() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const path = await uploadSiteLogo(file);
            await upsertSiteSetting("logo_path", path);
            return path;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", "logo_path"] });
        },
    });
}
