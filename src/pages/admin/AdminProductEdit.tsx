import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { listAreasByTheme, type AreaRow } from "../../api/areas.api";

import type {
    Departure,
    DepartStatus,
    ItineraryDay,
    ItineraryRow,
    MealType,
    OfferType,
    ProductStatus,
    ProductUpsert,
    ProductDetailBlock,
} from "../../types/product";

import {
    createProduct,
    getProduct,
    updateProduct,
    uid,
    uploadProductThumbnail,
} from "../../api/products.api";

import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "product-thumbnails";

/** ✅ 여행자 보험 기본 문구 */
const DEFAULT_TRAVEL_INSURANCE_TEXT = `보험 청구 시 필요 서류(현지 또는 공항에서 발급 필요)
1. 현지 병원 이용 : 진단서, 진료비세부내역서, 진료비계산서, 처방전과 일자 별 약제비계산서(카드 결제영수증은 사용 불가)
2. 도난 사고 : 현지 경찰서에서 발급된 도난신고 사실확인서, 피해물품 영수증(피해 입증자료) 필요
3. 항공사 수하물 관련 사고 : 항공사 보상 관련 확인서, 파손 시 수리 견적서 및 영수증 또는 수리불가 확인서 필요
- 일정 종료 후 보험기간의 개별 연장은 불가하며, 보장기간은 종료일로부터 90일 이내
- 상세 내용은 보험회사를 통해 확인해 주시기 바랍니다.`;

// public bucket용 썸네일 URL 만들기
function toPublicThumbUrl(raw: string) {
    const v = String(raw ?? "").trim();
    if (!v) return "";

    // 외부 URL이면 그대로
    if (/^https?:\/\//i.test(v)) return v;

    // 앞 / 제거
    let path = v.replace(/^\/+/, "");

    // bucket prefix가 섞여있으면 제거 (ex: product-thumbnails/thumb/xxx.png)
    const prefix = `${BUCKET_NAME}/`;
    if (path.startsWith(prefix)) path = path.slice(prefix.length);

    // public url 생성
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data?.publicUrl ?? "";
}

/* ---------------- tabs ---------------- */
type TabKey = "basic" | "bullets" | "itinerary" | "offers" | "assets" | "detail";

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "basic", label: "기본정보" },
    { key: "bullets", label: "포함/불포함" },
    { key: "itinerary", label: "일정표" },
    { key: "offers", label: "출발일·오퍼" },
    { key: "detail", label: "상세설명" },
    { key: "assets", label: "원본문서" },
];

const REGIONS = ["일본", "제주", "동남아", "유럽"] as const;

const STATUSES: Array<{ value: ProductStatus; label: string }> = [
    { value: "DRAFT", label: "임시" },
    { value: "PUBLISHED", label: "노출" },
    { value: "HIDDEN", label: "숨김" },
];

function clampInt(v: string, fallback = 0) {
    const n = Number(v);
    if (Number.isNaN(n)) return fallback;
    return Math.max(0, Math.floor(n));
}

function isTabKey(x: any): x is TabKey {
    return ["basic", "bullets", "detail", "itinerary", "offers", "assets"].includes(String(x));
}

/* ====================== MAIN ====================== */
export default function AdminProductEdit({ mode }: { mode: "create" | "edit" }) {
    const nav = useNavigate();
    const qc = useQueryClient();
    const params = useParams();

    const id = params.id ?? "";
    const tabParam = params.tab;
    const tab: TabKey = isTabKey(tabParam) ? tabParam : "basic";

    const tempProductIdRef = useRef<string>(uid("tmp_product"));
    useEffect(() => {
        // form에 임시 productId를 숨겨 저장 (create 모드에서만 사용)
        if (mode === "create") {
            setForm((prev: any) => ({ ...prev, __tempProductId: tempProductIdRef.current }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isTabKey(tabParam)) {
            if (mode === "create") nav("/admin/products/new/basic", { replace: true });
            else if (id) nav(`/admin/products/${id}/basic`, { replace: true });
        }
    }, [tabParam, mode, id, nav]);

    const goTab = (next: TabKey) => {
        if (mode === "create") nav(`/admin/products/new/${next}`);
        else nav(`/admin/products/${id}/${next}`);
    };

    /* ---------- themes ---------- */
    type ThemeRow = { id: string; name: string; slug: string; sort_order?: number | null };
    const [themes, setThemes] = useState<ThemeRow[]>([]);
    const [themesLoading, setThemesLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setThemesLoading(true);
                const { data, error } = await supabase
                    .from("product_themes")
                    .select("id,name,slug,sort_order")
                    .eq("is_active", true)
                    .order("sort_order", { ascending: true });
                if (error) throw error;
                setThemes((data ?? []) as ThemeRow[]);
            } finally {
                setThemesLoading(false);
            }
        })();
    }, []);

    /* ---------- form ---------- */
    const [form, setForm] = useState<ProductUpsert>({
        title: "",
        subtitle: "",
        // ✅ theme_id / area_id
        themeId: null as any,
        areaId: null as any,

        region: "일본",
        nights: 3,
        days: 4,
        status: "DRAFT",
        description: "",
        priceText: "상담 문의",

        // ✅ public bucket 썸네일: path 저장
        thumbnailPath: "",
        thumbnailUrl: "",

        images: [],
        included: [],
        excluded: [],
        notices: [],
        itinerary: [],
        departures: [],

        // ✅ 여행자 보험
        travelInsuranceEnabled: false,
        travelInsuranceContent: DEFAULT_TRAVEL_INSURANCE_TEXT,

        detailBlocks: [],
    } as any);

    /* ✅ themeId 기반 area 목록 로딩 */
    const themeId = String((form as any).themeId ?? "").trim();

    const areasQuery = useQuery({
        queryKey: ["admin", "areas", themeId],
        queryFn: () => listAreasByTheme(themeId),
        enabled: !!themeId,
        staleTime: 60_000,
    });

    const areas: AreaRow[] = (areasQuery.data ?? []) as AreaRow[];

    const onChangeTheme = (nextThemeId: string) => {
        // ✅ 테마 바뀌면 areaId는 초기화(null)
        setForm((prev: any) => ({
            ...prev,
            themeId: nextThemeId ? nextThemeId : null,
            areaId: null,
        }));
    };

    /* ---------- 썸네일 업로드 상태 ---------- */
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [thumbUploading, setThumbUploading] = useState(false);
    const [thumbPreview, setThumbPreview] = useState<string>("");

    useEffect(() => {
        const raw = ((form as any).thumbnailUrl || (form as any).thumbnailPath || "").trim();
        if (!raw) {
            setThumbPreview("");
            return;
        }
        setThumbPreview(toPublicThumbUrl(raw));
    }, [(form as any).thumbnailUrl, (form as any).thumbnailPath]);

    const onPickThumb = () => fileRef.current?.click();

    const onChangeThumbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setThumbUploading(true);

            // 1) 업로드 → path 반환 (ex: thumb/xxx.png)
            const path = await uploadProductThumbnail(file);

            // 2) publicUrl로 미리보기 URL 생성
            const publicUrl = toPublicThumbUrl(path);

            // 3) DB에는 path 저장(권장), UI 미리보기만 publicUrl 사용
            setForm((prev: any) => ({
                ...prev,
                thumbnailPath: path,
                thumbnailUrl: path,
            }));
            setThumbPreview(publicUrl);
        } finally {
            setThumbUploading(false);
            e.target.value = "";
        }
    };

    /* ---------- load product ---------- */
    useEffect(() => {
        if (mode === "edit") {
            (async () => {
                const p = await getProduct(id);
                if (!p) return;

                setForm({
                    title: (p as any).title ?? "",
                    subtitle: (p as any).subtitle ?? "",
                    themeId: (p as any).themeId ?? null,
                    areaId: (p as any).areaId ?? null,
                    region: (p as any).region ?? "일본",
                    nights: (p as any).nights ?? 3,
                    days: (p as any).days ?? 4,
                    status: ((p as any).status ?? "DRAFT") as ProductStatus,
                    description: (p as any).description ?? "",
                    priceText: (p as any).priceText ?? "",
                    thumbnailPath: (p as any).thumbnailPath ?? "",
                    thumbnailUrl: (p as any).thumbnailUrl ?? "",
                    images: (p as any).images ?? [],
                    included: (p as any).included ?? [],
                    excluded: (p as any).excluded ?? [],
                    notices: (p as any).notices ?? [],
                    itinerary: (p as any).itinerary ?? [],
                    departures: (p as any).departures ?? [],

                    // ✅ 여행자 보험
                    travelInsuranceEnabled: (p as any).travelInsuranceEnabled ?? false,
                    travelInsuranceContent: (p as any).travelInsuranceContent ?? DEFAULT_TRAVEL_INSURANCE_TEXT,

                    detailBlocks: (p as any).detailBlocks ?? [],
                } as any);

                // thumbnailUrl이 비어있고 path만 있는 경우 보정
                const raw = String((p as any).thumbnailPath ?? (p as any).thumbnailUrl ?? "").trim();
                if (raw) setThumbPreview(toPublicThumbUrl(raw));
            })();
        }
    }, [mode, id]);

    /* ---------- save ---------- */
    const save = useMutation({
        mutationFn: async () => {
            if (mode === "create") return createProduct(form);
            return updateProduct(id, form);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            nav("/admin/products", { replace: true });
        },
    });

    /* ====================== UI ====================== */
    return (
        <div className="relative">
            {/* ---------- header ---------- */}
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-extrabold text-neutral-100">
                        {mode === "create" ? "새 상품 등록" : "상품 수정"}
                    </div>
                    <div className="mt-1 text-xs text-neutral-400">모바일에서도 편집 가능합니다</div>
                </div>

                {/* ✅ PC 상단 액션 */}
                <div className="hidden items-center gap-2 md:flex">
                    <button
                        type="button"
                        onClick={() => nav("/admin/products")}
                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={() => save.mutate()}
                        className="rounded-xl bg-[#2E97F2] px-4 py-2 text-sm font-extrabold text-white hover:brightness-95"
                    >
                        저장
                    </button>
                </div>
            </div>

            {/* ---------- tabs (mobile friendly) ---------- */}
            <div className="sticky top-[56px] z-20 -mx-4 mt-4 bg-black/80 px-4 backdrop-blur">
                <div className="flex gap-2 overflow-x-auto py-3">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => goTab(t.key)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                                tab === t.key ? "bg-neutral-50 text-neutral-950" : "bg-neutral-900 text-neutral-300"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ---------- body ---------- */}
            <div className="mt-6 space-y-6">
                {tab === "basic" && (
                    <Section title="기본 정보">
                        <Field label="제목">
                            <input
                                value={(form as any).title}
                                onChange={(e) => setForm({ ...(form as any), title: e.target.value } as any)}
                                className="input w-full"
                                placeholder="예) 오키나와 3박4일 골프 패키지"
                            />
                        </Field>

                        <Field label="부제">
                            <input
                                value={(form as any).subtitle}
                                onChange={(e) => setForm({ ...(form as any), subtitle: e.target.value } as any)}
                                className="input w-full"
                                placeholder="예) #1인1실 #온천 #시내호텔"
                            />
                        </Field>

                        {/* ✅ 썸네일 업로드 */}
                        <Field label="썸네일 이미지">
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
                                <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black/30">
                                    <div className="aspect-[16/10] w-full">
                                        {thumbPreview ? (
                                            <img
                                                src={thumbPreview}
                                                alt="thumbnail"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-sm text-neutral-400">
                                                썸네일이 아직 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onChangeThumbFile}
                                    />

                                    <button
                                        type="button"
                                        onClick={onPickThumb}
                                        disabled={thumbUploading}
                                        className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                                            thumbUploading
                                                ? "bg-neutral-800 text-neutral-400"
                                                : "bg-neutral-50 text-neutral-950 hover:bg-white"
                                        }`}
                                    >
                                        {thumbUploading ? "업로드 중..." : "이미지 업로드"}
                                    </button>

                                    {(form as any).thumbnailPath || thumbPreview ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((prev: any) => ({ ...prev, thumbnailPath: "", thumbnailUrl: "" }));
                                                setThumbPreview("");
                                            }}
                                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                                        >
                                            제거
                                        </button>
                                    ) : null}
                                </div>

                                <div className="mt-2 text-xs text-neutral-500">
                                    Public bucket(product-thumbnails) / Public URL 방식 (권장: 16:10, 최대 5MB)
                                </div>
                            </div>
                        </Field>

                        {/* ✅ theme */}
                        <Field label="테마(상단 카테고리)">
                            <select
                                value={(form as any).themeId ?? ""}
                                onChange={(e) => onChangeTheme(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">{themesLoading ? "불러오는 중..." : "선택 안 함"}</option>
                                {themes.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-1 text-[11px] text-neutral-500">
                                고객 페이지 상단 메뉴 및 /theme/:slug 분류에 사용됩니다.
                            </div>
                        </Field>

                        {/* ✅ product_area (하위 지역) */}
                        <Field label="지역(하위, product_area)">
                            <select
                                value={(form as any).areaId ?? ""}
                                onChange={(e) =>
                                    setForm((prev: any) => ({
                                        ...prev,
                                        areaId: e.target.value ? e.target.value : null,
                                    }))
                                }
                                disabled={!themeId || areasQuery.isLoading}
                                className="input w-full disabled:opacity-60"
                            >
                                <option value="">
                                    {!themeId
                                        ? "테마를 먼저 선택하세요"
                                        : areasQuery.isLoading
                                            ? "불러오는 중..."
                                            : "전체/미지정"}
                                </option>

                                {areas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>

                            {themeId && !areasQuery.isLoading && areas.length === 0 ? (
                                <div className="mt-1 text-[11px] text-neutral-500">
                                    이 테마에 활성화된 지역(product_area)이 없습니다. 먼저 지역을 등록하세요.
                                </div>
                            ) : null}
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="지역(레거시 region)">
                                <select
                                    value={(form as any).region}
                                    onChange={(e) => setForm({ ...(form as any), region: e.target.value } as any)}
                                    className="input w-full"
                                >
                                    {REGIONS.map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="상태">
                                <select
                                    value={(form as any).status}
                                    onChange={(e) => setForm({ ...(form as any), status: e.target.value } as any)}
                                    className="input w-full"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="박">
                                <input
                                    value={(form as any).nights}
                                    inputMode="numeric"
                                    onChange={(e) => setForm({ ...(form as any), nights: clampInt(e.target.value) } as any)}
                                    className="input w-full"
                                />
                            </Field>
                            <Field label="일">
                                <input
                                    value={(form as any).days}
                                    inputMode="numeric"
                                    onChange={(e) => setForm({ ...(form as any), days: clampInt(e.target.value) } as any)}
                                    className="input w-full"
                                />
                            </Field>
                        </div>

                        <Field label="가격 문구(옵션)">
                            <input
                                value={(form as any).priceText ?? ""}
                                onChange={(e) => setForm({ ...(form as any), priceText: e.target.value } as any)}
                                className="input w-full"
                                placeholder="예) 1,059,000원~ / 상담 문의"
                            />
                        </Field>

                        <Field label="상품 소개(옵션)">
                            <textarea
                                value={(form as any).description ?? ""}
                                onChange={(e) => setForm({ ...(form as any), description: e.target.value } as any)}
                                className="input w-full min-h-[120px] resize-y"
                                placeholder="상품 소개를 입력하세요"
                            />
                        </Field>
                    </Section>
                )}

                {tab === "bullets" && (
                    <Section title="포함 / 불포함 / 참고">
                        <ListEditor title="포함" items={(form as any).included} onChange={(v) => setForm({ ...(form as any), included: v } as any)} />
                        <ListEditor title="불포함" items={(form as any).excluded} onChange={(v) => setForm({ ...(form as any), excluded: v } as any)} />
                        <ListEditor title="참고" items={(form as any).notices} onChange={(v) => setForm({ ...(form as any), notices: v } as any)} />

                        {/* ✅ 여행자 보험(유무 + 내용) */}
                        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-3">
                            <div className="text-sm font-extrabold text-neutral-100">여행자 보험</div>

                            <label className="flex items-center gap-2 text-sm text-neutral-200">
                                <input
                                    type="checkbox"
                                    checked={Boolean((form as any).travelInsuranceEnabled)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setForm((prev: any) => ({
                                            ...prev,
                                            travelInsuranceEnabled: checked,
                                            travelInsuranceContent: checked
                                                ? (prev.travelInsuranceContent?.trim()
                                                    ? prev.travelInsuranceContent
                                                    : DEFAULT_TRAVEL_INSURANCE_TEXT)
                                                : prev.travelInsuranceContent ?? "",
                                        }));
                                    }}
                                />
                                상품 상세에 “여행자 보험” 섹션 노출
                            </label>

                            {Boolean((form as any).travelInsuranceEnabled) ? (
                                <div>
                                    <div className="text-xs text-neutral-400">
                                        아래 내용을 상품 상세페이지에 그대로 노출합니다.
                                    </div>
                                    <textarea
                                        value={String((form as any).travelInsuranceContent ?? "")}
                                        onChange={(e) =>
                                            setForm((prev: any) => ({
                                                ...prev,
                                                travelInsuranceContent: e.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full min-h-[180px] rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:outline-none"
                                        placeholder="여행자 보험 안내 내용을 입력하세요"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </Section>
                )}

                {tab === "itinerary" && (
                    <Section title="일정표">
                        <ItineraryEditor days={(form as any).itinerary ?? []} onChange={(v) => setForm({ ...(form as any), itinerary: v } as any)} />
                    </Section>
                )}

                {tab === "offers" && (
                    <Section title="출발일 · 오퍼">
                        <OffersEditor items={(form as any).departures ?? []} onChange={(v) => setForm({ ...(form as any), departures: v } as any)} />
                    </Section>
                )}

                {tab === "assets" && (
                    <Section title="원본문서">
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-300">
                            다음 단계에서 문서 업로드 기능을 붙입니다.
                        </div>
                    </Section>
                )}

                {tab === "detail" && (
                    <Section title="상세 블록 (상세페이지 본문 구성)">
                        <DetailBlocksEditor
                            blocks={((form as any).detailBlocks ?? [])}
                            onChange={(v) => setForm({ ...(form as any), detailBlocks: v } as any)}
                        />
                    </Section>
                )}

            </div>

            {/* ---------- mobile sticky actions ---------- */}
            <div className="sticky bottom-0 z-30 -mx-4 mt-8 bg-black/80 px-4 py-3 backdrop-blur md:hidden">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => nav("/admin/products")} className="rounded-xl border border-neutral-800 py-3 text-sm font-bold text-neutral-200">
                        취소
                    </button>
                    <button onClick={() => save.mutate()} className="rounded-xl bg-[#2E97F2] py-3 text-sm font-extrabold text-white">
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ====================== UI PARTS ====================== */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
            <div className="text-sm font-extrabold text-neutral-100">{title}</div>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-xs font-semibold text-neutral-400">{label}</div>
            {children}
        </div>
    );
}

function ListEditor({ title, items, onChange }: { title: string; items: string[]; onChange: (v: string[]) => void }) {
    const [draft, setDraft] = useState("");

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
            <div className="text-sm font-bold text-neutral-200">{title}</div>

            <div className="mt-2 flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} className="input flex-1" />
                <button
                    type="button"
                    onClick={() => {
                        if (!draft.trim()) return;
                        onChange([...(items ?? []), draft.trim()]);
                        setDraft("");
                    }}
                    className="rounded-xl bg-neutral-50 px-3 py-2 text-sm font-bold text-neutral-950"
                >
                    추가
                </button>
            </div>

            <div className="mt-3 space-y-2">
                {(items ?? []).map((x, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-200">
                        <span className="min-w-0 flex-1">{x}</span>
                        <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-xs text-neutral-400">
                            삭제
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ====================== OFFERS (출발일/오퍼) ====================== */
function OffersEditor({ items, onChange }: { items: Departure[]; onChange: (v: Departure[]) => void }) {
    const add = () => {
        onChange([
            ...(items ?? []),
            {
                id: uid("dep"),
                dateISO: "",
                offerType: "NORMAL" as OfferType,
                status: "AVAILABLE" as DepartStatus,
                priceAdult: 0,
                remain: undefined,
                min: undefined,
                max: undefined,
                note: "",
            },
        ]);
    };

    const update = (idx: number, patch: Partial<Departure>) => {
        const next = [...(items ?? [])];
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const remove = (idx: number) => {
        onChange((items ?? []).filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-3">
            {(items ?? []).length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                    아직 등록된 출발일이 없습니다. 아래 버튼으로 추가하세요.
                </div>
            ) : null}

            {(items ?? []).map((d, i) => (
                <div key={d.id ?? i} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <div className="mb-1 text-xs font-semibold text-neutral-400">출발일</div>
                            <input type="date" value={d.dateISO ?? ""} onChange={(e) => update(i, { dateISO: e.target.value })} className="input" />
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">오퍼</div>
                            <select value={d.offerType ?? "NORMAL"} onChange={(e) => update(i, { offerType: e.target.value as OfferType })} className="input">
                                <option value="NORMAL">기본</option>
                                <option value="EVENT">이벤트</option>
                                <option value="SPECIAL">특가</option>
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">상태</div>
                            <select value={d.status ?? "AVAILABLE"} onChange={(e) => update(i, { status: e.target.value as DepartStatus })} className="input">
                                <option value="AVAILABLE">예약가능</option>
                                <option value="CONFIRMED">출발확정</option>
                                <option value="INQUIRY">가격문의</option>
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">성인가(원)</div>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={d.priceAdult ?? 0}
                                disabled={d.status === "INQUIRY"}
                                onChange={(e) => update(i, { priceAdult: clampInt(e.target.value) })}
                                className={`input ${d.status === "INQUIRY" ? "opacity-60" : ""}`}
                            />
                            {d.status === "INQUIRY" ? (
                                <div className="mt-1 text-[11px] text-neutral-500">상태가 ‘가격문의’면 가격 입력이 비활성화됩니다.</div>
                            ) : null}
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">잔여(선택)</div>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={d.remain ?? ""}
                                onChange={(e) => update(i, { remain: e.target.value === "" ? undefined : clampInt(e.target.value) })}
                                className="input"
                            />
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">최소(선택)</div>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={d.min ?? ""}
                                onChange={(e) => update(i, { min: e.target.value === "" ? undefined : clampInt(e.target.value) })}
                                className="input"
                            />
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-neutral-400">최대(선택)</div>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={d.max ?? ""}
                                onChange={(e) => update(i, { max: e.target.value === "" ? undefined : clampInt(e.target.value) })}
                                className="input"
                            />
                        </div>

                        <div className="col-span-2">
                            <div className="mb-1 text-xs font-semibold text-neutral-400">메모(선택)</div>
                            <input value={d.note ?? ""} onChange={(e) => update(i, { note: e.target.value })} className="input" placeholder="예: 특가 좌석 한정, 이벤트 안내 등" />
                        </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <button type="button" onClick={() => remove(i)} className="text-xs font-bold text-rose-400">
                            삭제
                        </button>
                    </div>
                </div>
            ))}

            <button type="button" onClick={add} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 py-3 text-sm font-bold text-neutral-200">
                + 출발일 추가
            </button>
        </div>
    );
}

/* ====================== ITINERARY (일정표) ====================== */
function ItineraryEditor({ days, onChange }: { days: ItineraryDay[]; onChange: (v: ItineraryDay[]) => void }) {
    const renumberDays = (arr: ItineraryDay[]) =>
        arr.map((d, idx) => ({
            ...d,
            dayNo: idx + 1,
            title: d.title || `${idx + 1}일차`,
        }));

    const addDay = () => {
        const next = renumberDays([
            ...(days ?? []),
            {
                id: uid("day"),
                dayNo: (days?.length ?? 0) + 1,
                title: `${(days?.length ?? 0) + 1}일차`,
                dateText: "",
                rows: [],
            },
        ]);
        onChange(next);
    };

    const removeDay = (idx: number) => {
        const next = renumberDays((days ?? []).filter((_, i) => i !== idx));
        onChange(next);
    };

    const updateDay = (idx: number, patch: Partial<ItineraryDay>) => {
        const next = [...(days ?? [])];
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const addRow = (dayIdx: number) => {
        const next = [...(days ?? [])];
        const row: ItineraryRow = {
            id: uid("row"),
            place: "",
            transport: "",
            time: "",
            content: "",
            mealMorning: "NONE" as MealType,
            mealLunch: "NONE" as MealType,
            mealDinner: "NONE" as MealType,
        };
        next[dayIdx] = { ...next[dayIdx], rows: [...(next[dayIdx].rows ?? []), row] };
        onChange(next);
    };

    const removeRow = (dayIdx: number, rowIdx: number) => {
        const next = [...(days ?? [])];
        const rows = (next[dayIdx].rows ?? []).filter((_, i) => i !== rowIdx);
        next[dayIdx] = { ...next[dayIdx], rows };
        onChange(next);
    };

    const updateRow = (dayIdx: number, rowIdx: number, patch: Partial<ItineraryRow>) => {
        const next = [...(days ?? [])];
        const rows = [...(next[dayIdx].rows ?? [])];
        rows[rowIdx] = { ...rows[rowIdx], ...patch };
        next[dayIdx] = { ...next[dayIdx], rows };
        onChange(next);
    };

    const MealSelect = ({ value, onChange }: { value: MealType; onChange: (v: MealType) => void }) => (
        <select value={value} onChange={(e) => onChange(e.target.value as MealType)} className="input">
            <option value="NONE">없음</option>
            <option value="INCLUDED">포함</option>
            <option value="NOT_INCLUDED">불포함</option>
        </select>
    );

    return (
        <div className="space-y-3">
            {(days ?? []).length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                    아직 일정표가 없습니다. 아래 버튼으로 일차를 추가하세요.
                </div>
            ) : null}

            {(days ?? []).map((d, di) => (
                <div key={d.id ?? di} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 text-xs font-semibold text-neutral-400">일차 제목</div>
                            <input value={d.title ?? `${d.dayNo}일차`} onChange={(e) => updateDay(di, { title: e.target.value })} className="input" />
                        </div>
                        <button type="button" onClick={() => removeDay(di)} className="mt-6 text-xs font-bold text-rose-400">
                            삭제
                        </button>
                    </div>

                    <div className="mt-3">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">날짜 텍스트(선택)</div>
                        <input value={d.dateText ?? ""} onChange={(e) => updateDay(di, { dateText: e.target.value })} className="input" placeholder="예: 2026-03-21, 3/21(토) 등" />
                    </div>

                    {/* rows */}
                    <div className="mt-4 space-y-3">
                        {(d.rows ?? []).map((r, ri) => (
                            <div key={r.id ?? ri} className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">내용</div>
                                        <textarea value={r.content ?? ""} onChange={(e) => updateRow(di, ri, { content: e.target.value })} className="input min-h-[90px] resize-y" placeholder="일정 내용을 입력하세요" />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">장소</div>
                                        <input value={r.place ?? ""} onChange={(e) => updateRow(di, ri, { place: e.target.value })} className="input" />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">교통</div>
                                        <input value={r.transport ?? ""} onChange={(e) => updateRow(di, ri, { transport: e.target.value })} className="input" />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">시간</div>
                                        <input value={r.time ?? ""} onChange={(e) => updateRow(di, ri, { time: e.target.value })} className="input" placeholder="예: 10:30" />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">식사(아침)</div>
                                        <MealSelect value={r.mealMorning ?? ("NONE" as MealType)} onChange={(v) => updateRow(di, ri, { mealMorning: v })} />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">식사(점심)</div>
                                        <MealSelect value={r.mealLunch ?? ("NONE" as MealType)} onChange={(v) => updateRow(di, ri, { mealLunch: v })} />
                                    </div>

                                    <div>
                                        <div className="mb-1 text-xs font-semibold text-neutral-400">식사(저녁)</div>
                                        <MealSelect value={r.mealDinner ?? ("NONE" as MealType)} onChange={(v) => updateRow(di, ri, { mealDinner: v })} />
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <button type="button" onClick={() => removeRow(di, ri)} className="text-xs font-bold text-rose-400">
                                        일정 삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={() => addRow(di)} className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-950/40 py-3 text-sm font-bold text-neutral-200">
                        + 일정 추가
                    </button>
                </div>
            ))}

            <button type="button" onClick={addDay} className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 py-3 text-sm font-bold text-neutral-200">
                + 일차 추가
            </button>
        </div>
    );
}

async function uploadDetailImage(
    file: File,
    productId: string,
    blockId: string,
    index: number
) {
    const path = `products/${productId}/detail/${blockId}/${index}.webp`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            upsert: true,
            contentType: file.type || "image/webp",
            cacheControl: "3600",
        });

    if (error) throw error;
    return path;
}

async function deleteDetailImage(path: string) {
    if (!path) return;
    await supabase.storage.from(BUCKET_NAME).remove([path]);
}

function getPublicUrl(pathOrUrl: string) {
    const v = String(pathOrUrl ?? "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;

    const clean = v.replace(/^\/+/, "");
    const prefix = `${BUCKET_NAME}/`;
    const normalized = clean.startsWith(prefix) ? clean.slice(prefix.length) : clean;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(normalized);
    return data?.publicUrl ?? "";
}

/* ====================== DETAIL BLOCKS (상세 블록) ====================== */
function DetailBlocksEditor({
                                blocks,
                                onChange,
                            }: {
    blocks: any[];
    onChange: (v: any[]) => void;
}) {
    const list = Array.isArray(blocks) ? blocks : [];

    const addBlock = (type: "TITLE" | "TEXT" | "IMAGE_SLIDER") => {
        const id = uid("blk");
        const base: any = { id, type };

        if (type === "TITLE" || type === "TEXT") {
            base.text = "";
        } else {
            base.title = "";
            base.description = "";
            base.images = [];
        }

        onChange([...list, base]);
    };

    const update = (idx: number, patch: any) => {
        const next = [...list];
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const remove = (idx: number) => onChange(list.filter((_, i) => i !== idx));

    const move = (idx: number, dir: -1 | 1) => {
        const j = idx + dir;
        if (j < 0 || j >= list.length) return;
        const next = [...list];
        const tmp = next[idx];
        next[idx] = next[j];
        next[j] = tmp;
        onChange(next);
    };

    const addImage = (idx: number) => {
        const b = list[idx];
        const images = Array.isArray(b?.images) ? b.images : [];
        update(idx, { images: [...images, { path: "", caption: "" }] });
    };

    const updateImage = (idx: number, imgIdx: number, patch: any) => {
        const b = list[idx];
        const images = Array.isArray(b?.images) ? [...b.images] : [];
        images[imgIdx] = { ...images[imgIdx], ...patch };
        update(idx, { images });
    };

    const removeImage = (idx: number, imgIdx: number) => {
        const b = list[idx];
        const images = Array.isArray(b?.images) ? b.images : [];
        update(idx, { images: images.filter((_: any, i: number) => i !== imgIdx) });
    };

    return (
        <div className="space-y-3">
            {/* add buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => addBlock("TITLE")}
                    className="rounded-xl bg-neutral-50 px-3 py-2 text-sm font-extrabold text-neutral-950"
                >
                    + 제목 블록
                </button>
                <button
                    type="button"
                    onClick={() => addBlock("TEXT")}
                    className="rounded-xl bg-neutral-50 px-3 py-2 text-sm font-extrabold text-neutral-950"
                >
                    + 텍스트 블록
                </button>
                <button
                    type="button"
                    onClick={() => addBlock("IMAGE_SLIDER")}
                    className="rounded-xl bg-neutral-50 px-3 py-2 text-sm font-extrabold text-neutral-950"
                >
                    + 이미지 슬라이더
                </button>
            </div>

            {list.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                    아직 상세 블록이 없습니다. 위 버튼으로 추가하세요.
                </div>
            ) : null}

            {/* blocks */}
            {list.map((b: any, idx: number) => (
                <div key={b?.id ?? idx} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-neutral-400">블록 타입</div>
                            <div className="mt-1 text-sm font-extrabold text-neutral-100">
                                {b.type === "TITLE" ? "TITLE" : b.type === "TEXT" ? "TEXT" : "IMAGE_SLIDER"}
                            </div>
                            <div className="mt-1 text-[11px] text-neutral-500">id: {b?.id}</div>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => move(idx, -1)} className="text-xs font-bold text-neutral-300">
                                ↑
                            </button>
                            <button type="button" onClick={() => move(idx, 1)} className="text-xs font-bold text-neutral-300">
                                ↓
                            </button>
                            <button type="button" onClick={() => remove(idx)} className="text-xs font-bold text-rose-400">
                                삭제
                            </button>
                        </div>
                    </div>

                    {/* TITLE/TEXT */}
                    {(b.type === "TITLE" || b.type === "TEXT") ? (
                        <div className="mt-4">
                            <div className="mb-1 text-xs font-semibold text-neutral-400">텍스트</div>
                            <textarea
                                value={String(b.text ?? "")}
                                onChange={(e) => update(idx, { text: e.target.value })}
                                className="input w-full min-h-[120px] resize-y"
                                placeholder={b.type === "TITLE" ? "섹션 제목을 입력" : "본문 텍스트를 입력"}
                            />
                        </div>
                    ) : null}

                    {/* IMAGE_SLIDER */}
                    {b.type === "IMAGE_SLIDER" ? (
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="mb-1 text-xs font-semibold text-neutral-400">슬라이더 제목(선택)</div>
                                <input
                                    value={String(b.title ?? "")}
                                    onChange={(e) => update(idx, { title: e.target.value })}
                                    className="input w-full"
                                    placeholder="예: 숙소 / 골프장"
                                />
                            </div>

                            <div>
                                <div className="mb-1 text-xs font-semibold text-neutral-400">설명(선택)</div>
                                <textarea
                                    value={String(b.description ?? "")}
                                    onChange={(e) => update(idx, { description: e.target.value })}
                                    className="input w-full min-h-[100px] resize-y"
                                    placeholder="슬라이더 하단 설명"
                                />
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-neutral-200">이미지 목록</div>
                                    <button
                                        type="button"
                                        onClick={() => addImage(idx)}
                                        className="rounded-lg bg-neutral-50 px-3 py-2 text-xs font-extrabold text-neutral-950"
                                    >
                                        + 이미지 추가
                                    </button>
                                </div>

                                {(Array.isArray(b.images) ? b.images : []).length === 0 ? (
                                    <div className="mt-2 text-sm text-neutral-400">아직 이미지가 없습니다.</div>
                                ) : null}

                                <div className="mt-3 space-y-3">
                                    {(Array.isArray(b.images) ? b.images : []).map((img: any, ii: number) => (
                                        <div key={ii} className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                <div>
                                                    <div className="mb-1 text-xs font-semibold text-neutral-400">path</div>
                                                    <input
                                                        value={String(img?.path ?? "")}
                                                        onChange={(e) => updateImage(idx, ii, { path: e.target.value })}
                                                        className="input w-full"
                                                        placeholder="products/{productId}/detail/{blockId}/0.webp 또는 public url"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-xs font-semibold text-neutral-400">caption(선택)</div>
                                                    <input
                                                        value={String(img?.caption ?? "")}
                                                        onChange={(e) => updateImage(idx, ii, { caption: e.target.value })}
                                                        className="input w-full"
                                                        placeholder="예: 로비 전경"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-2 flex justify-end">
                                                <button type="button" onClick={() => removeImage(idx, ii)} className="text-xs font-bold text-rose-400">
                                                    이미지 삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-[11px] text-neutral-500">
                                * 지금은 path/url 입력 방식(업로드는 다음 단계). DB에는 그대로 jsonb로 저장됩니다.
                            </div>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

