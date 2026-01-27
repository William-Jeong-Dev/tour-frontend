import { supabase } from "../lib/supabase";

const BUCKET = "site-assets";

export async function getSiteSetting(key: string): Promise<string> {
    const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();

    if (error) throw error;
    return data?.value ?? "";
}

export async function upsertSiteSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });

    if (error) throw error;
}

// 외부 URL이면 그대로, 아니면 site-assets public url 생성
export function getPublicSiteAssetUrl(pathOrUrl: string): string {
    const raw = (pathOrUrl ?? "").trim();
    if (!raw) return "";

    if (/^https?:\/\//i.test(raw)) return raw;

    // "/branding/logo.png" 처럼 들어와도 안전하게
    let path = raw.replace(/^\/+/, "");

    // 혹시 "site-assets/..." 같이 들어오면 bucket prefix 제거
    const prefix = `${BUCKET}/`;
    if (path.startsWith(prefix)) path = path.slice(prefix.length);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? "";
}

export async function uploadSiteLogo(file: File): Promise<string> {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt = ext === "svg" || ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp" ? ext : "png";

    // 캐시 문제 줄이기 위해 매번 uuid 스타일로 저장
    const filename = `branding/logo-${crypto.randomUUID()}.${safeExt}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
        });

    if (error) throw error;
    return filename; // DB에는 path만 저장
}
