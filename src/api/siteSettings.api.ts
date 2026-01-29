import { supabase } from "../lib/supabase";

const BUCKET = "site-assets";
const PRODUCT_THUMB_BUCKET = "product-thumbnails";

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
    return getPublicBucketUrl(BUCKET, pathOrUrl);
}

export async function uploadSiteLogo(file: File): Promise<string> {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt =
        ext === "svg" || ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp"
            ? ext
            : "png";

    // 캐시 문제 줄이기 위해 매번 uuid 스타일로 저장
    const filename = `branding/logo-${crypto.randomUUID()}.${safeExt}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
    });

    if (error) throw error;
    return filename; // DB에는 path만 저장
}

/**
 * ✅ 범용 업로드 유틸 (Hero 슬라이드/카드 등에서 재사용)
 * - dir 예: "hero", "hero/cards"
 * - 반환: "hero/<uuid>.png" 같은 path (DB에는 path 저장)
 */
export async function uploadSiteAsset(file: File, dir: string): Promise<string> {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt =
        ext === "svg" || ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp"
            ? ext
            : "png";

    const cleanDir = (dir || "")
        .trim()
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

    const filename = `${cleanDir}/${crypto.randomUUID()}.${safeExt}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
    });

    if (error) throw error;
    return filename;
}

export function getPublicBucketUrl(bucket: string, pathOrUrl: string): string {
    const raw = (pathOrUrl ?? "").trim();
    if (!raw) return "";

    // 이미 URL이면 그대로
    if (/^https?:\/\//i.test(raw)) return raw;

    // "/thumb/xxx.jpg" 같은 것도 처리
    let path = raw.replace(/^\/+/, "").replace(/\\/g, "/").trim();

    // 혹시 "bucket/..." 형태로 들어오면 bucket prefix 제거
    const prefix = `${bucket}/`;
    if (path.startsWith(prefix)) path = path.slice(prefix.length);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? "";
}

export function getPublicProductThumbUrl(pathOrUrl: string): string {
    return getPublicBucketUrl(PRODUCT_THUMB_BUCKET, pathOrUrl);
}