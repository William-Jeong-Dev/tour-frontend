import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSetting, upsertSiteSetting, uploadSiteAsset, getPublicSiteAssetUrl } from "../api/siteSettings.api";

export interface FooterSettings {
    customerService: {
        phone1: string;
        phone2: string;
    };
    companyInfo: {
        name: string;
        representative: string;
        address: string;
        phone: string;
        email: string;
        fax: string;
        businessNumber: string;
        onlineBusinessNumber: string;
        tourLicense: string;
    };
    logo: string;
    copyright: string;
    poweredBy: string;
}

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
    customerService: {
        phone1: "051-747-8207",
        phone2: "010-8688-8810",
    },
    companyInfo: {
        name: "청원여행사",
        representative: "김동현",
        address: "부산광역시 해운대구 해운대로 216 2층",
        phone: "(051) 747-8207",
        email: "chungwon87@naver.com",
        fax: "(051) 747-8204",
        businessNumber: "473-15-00667",
        onlineBusinessNumber: "제2023-부산해운대-1696호",
        tourLicense: "제2017-000026호",
    },
    logo: "/card_thumbnail.svg",
    copyright: "Copyright @ 청원여행사 All Rights Reserved.",
    poweredBy: "Powered by Findvalue Crop",
};

export function useFooterSettings() {
    return useQuery({
        queryKey: ["siteSetting", "footerSettings"],
        queryFn: async () => {
            const value = await getSiteSetting("footerSettings");
            if (!value) return DEFAULT_FOOTER_SETTINGS;
            try {
                const parsed = JSON.parse(value) as FooterSettings;
                // Ensure logo URL is public
                if (parsed.logo && !parsed.logo.startsWith("http")) {
                    parsed.logo = getPublicSiteAssetUrl(parsed.logo);
                }
                return parsed;
            } catch {
                return DEFAULT_FOOTER_SETTINGS;
            }
        },
        staleTime: 60_000,
    });
}

export function useUpdateFooterSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (settings: FooterSettings) => {
            const value = JSON.stringify(settings);
            await upsertSiteSetting("footerSettings", value);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", "footerSettings"] });
        },
    });
}

export function useUploadFooterLogo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const path = await uploadSiteAsset(file, "footer");
            return path;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["siteSetting", "footerSettings"] });
        },
    });
}
