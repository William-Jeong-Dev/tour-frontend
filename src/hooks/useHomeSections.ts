import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSetting, upsertSiteSetting } from "../api/siteSettings.api";

export type HomeSectionConfig = {
    enabled: boolean;
    title: string;
    productIds: string[]; // 지정 안하면 fallback(자동)
    tags?: string[]; // onsen에서만 사용(선택)
};

const KEY_SPECIAL = "home_special_section";
const KEY_ONSEN = "home_onsen_section";

const defaultSpecial: HomeSectionConfig = {
    enabled: true,
    title: "특가 🔥 얼리버드 골프",
    productIds: [],
};

const defaultOnsen: HomeSectionConfig = {
    enabled: true,
    title: "골프여행, 고르기 어려울 땐 🤔 ?",
    productIds: [],
    tags: ["오키나와", "시내호텔", "가성비", "프리미엄"],
};

function safeParseConfig(raw: string, fallback: HomeSectionConfig): HomeSectionConfig {
    try {
        const obj = JSON.parse(raw || "");
        return {
            enabled: typeof obj.enabled === "boolean" ? obj.enabled : fallback.enabled,
            title: typeof obj.title === "string" ? obj.title : fallback.title,
            productIds: Array.isArray(obj.productIds) ? obj.productIds.filter(Boolean) : fallback.productIds,
            tags: Array.isArray(obj.tags) ? obj.tags.filter(Boolean) : fallback.tags,
        };
    } catch {
        return fallback;
    }
}

export function useHomeSpecialSection() {
    return useQuery({
        queryKey: ["siteSetting", KEY_SPECIAL],
        queryFn: async () => {
            const raw = await getSiteSetting(KEY_SPECIAL);
            return safeParseConfig(raw, defaultSpecial);
        },
        staleTime: 60_000,
    });
}

export function useHomeOnsenSection() {
    return useQuery({
        queryKey: ["siteSetting", KEY_ONSEN],
        queryFn: async () => {
            const raw = await getSiteSetting(KEY_ONSEN);
            return safeParseConfig(raw, defaultOnsen);
        },
        staleTime: 60_000,
    });
}

export function useSaveHomeSpecialSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (cfg: HomeSectionConfig) => {
            await upsertSiteSetting(KEY_SPECIAL, JSON.stringify(cfg));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", KEY_SPECIAL] });
        },
    });
}

export function useSaveHomeOnsenSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (cfg: HomeSectionConfig) => {
            await upsertSiteSetting(KEY_ONSEN, JSON.stringify(cfg));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", KEY_ONSEN] });
        },
    });
}
