import { useEffect, useMemo, useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../types/product";
import {
    useHomeOnsenSection,
    useHomeSpecialSection,
    useSaveHomeOnsenSection,
    useSaveHomeSpecialSection,
    type HomeSectionConfig,
} from "../../hooks/useHomeSections";

function pickPublished(products: Product[]) {
    return (products ?? []).filter((p) => p.status === "PUBLISHED");
}

function ProductPicker({
                           products,
                           selectedIds,
                           onChange,
                       }: {
    products: Product[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}) {
    const set = useMemo(() => new Set(selectedIds), [selectedIds]);

    const toggle = (id: string) => {
        const next = new Set(set);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange(Array.from(next));
    };

    const move = (id: string, dir: -1 | 1) => {
        const arr = [...selectedIds];
        const idx = arr.indexOf(id);
        if (idx < 0) return;
        const ni = idx + dir;
        if (ni < 0 || ni >= arr.length) return;
        [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
        onChange(arr);
    };

    const byId = useMemo(() => {
        const m = new Map<string, Product>();
        products.forEach((p) => m.set(p.id, p));
        return m;
    }, [products]);

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            {/* 전체 상품 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200">노출할 상품 선택 (체크)</div>
                <div className="mt-3 max-h-[360px] overflow-auto space-y-2 pr-2">
                    {products.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm text-neutral-200">
                            <input type="checkbox" checked={set.has(p.id)} onChange={() => toggle(p.id)} />
                            <span className="line-clamp-1">{p.title}</span>
                        </label>
                    ))}
                    {!products.length ? <div className="text-xs text-neutral-500">PUBLISHED 상품이 없습니다.</div> : null}
                </div>
                <div className="mt-2 text-xs text-neutral-500">선택을 비워두면 홈에서는 기존처럼 자동(슬라이스) 노출됩니다.</div>
            </div>

            {/* 선택된 상품(순서) */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200">선택된 상품 (순서)</div>
                <div className="mt-3 space-y-2">
                    {selectedIds.map((id) => {
                        const p = byId.get(id);
                        if (!p) return null;
                        return (
                            <div
                                key={id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-black/30 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <div className="text-sm text-neutral-100 line-clamp-1">{p.title}</div>
                                    <div className="text-xs text-neutral-500">{p.region || "지역 없음"}</div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => move(id, -1)}
                                        className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(id, 1)}
                                        className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {!selectedIds.length ? <div className="text-xs text-neutral-500">아직 선택된 상품이 없습니다.</div> : null}
                </div>
            </div>
        </div>
    );
}

function parseTags(text: string): string[] {
    return text
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function SectionEditor({
                           title,
                           cfg,
                           setCfg,
                           products,
                           onSave,
                           saving,
                           extraTags,
                           tagsText,
                           setTagsText,
                       }: {
    title: string;
    cfg: HomeSectionConfig;
    setCfg: (cfg: HomeSectionConfig) => void;
    products: Product[];
    onSave: () => void;
    saving: boolean;
    extraTags?: boolean;

    // ✅ 태그 입력용 문자열(IME 안전)
    tagsText?: string;
    setTagsText?: (v: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-5 space-y-4">
            <div>
                <div className="text-lg font-extrabold text-neutral-100">{title}</div>
                <div className="text-xs text-neutral-400">문구/노출/상품을 제어합니다.</div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} />
                섹션 노출
            </label>

            <div>
                <div className="text-sm font-bold text-neutral-200">문구(타이틀)</div>
                <input
                    value={cfg.title}
                    onChange={(e) => setCfg({ ...cfg, title: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 focus:outline-none"
                    placeholder="홈 섹션 타이틀"
                />
            </div>

            {/* ✅ 태그 입력: 입력 중에는 그대로 유지, blur/save에서만 파싱 */}
            {extraTags ? (
                <div>
                    <div className="text-sm font-bold text-neutral-200">태그(쉼표로 구분)</div>
                    <input
                        value={tagsText ?? (cfg.tags ?? []).join(",")}
                        onChange={(e) => {
                            // ✅ 입력은 있는 그대로 유지 (IME 문제 해결)
                            setTagsText?.(e.target.value);
                        }}
                        onBlur={() => {
                            // ✅ 포커스 빠질 때만 tags로 반영
                            const text = tagsText ?? (cfg.tags ?? []).join(",");
                            setCfg({ ...cfg, tags: parseTags(text) });
                        }}
                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 focus:outline-none"
                        placeholder="예) 오키나와,시내호텔,가성비,프리미엄"
                    />
                    <div className="mt-1 text-xs text-neutral-500">입력 후 다른 곳을 클릭하면 태그로 반영됩니다.</div>
                </div>
            ) : null}

            <ProductPicker products={products} selectedIds={cfg.productIds} onChange={(ids) => setCfg({ ...cfg, productIds: ids })} />

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-extrabold text-neutral-950 disabled:opacity-60"
                >
                    {saving ? "저장 중..." : "저장"}
                </button>
            </div>
        </div>
    );
}

export default function AdminHomeSections() {
    const productsQ = useProducts();
    const published = useMemo(() => pickPublished(productsQ.data ?? []), [productsQ.data]);

    const specialQ = useHomeSpecialSection();
    const onsenQ = useHomeOnsenSection();

    const saveSpecial = useSaveHomeSpecialSection();
    const saveOnsen = useSaveHomeOnsenSection();

    const [specialCfg, setSpecialCfg] = useState<HomeSectionConfig>({
        enabled: true,
        title: "특가 🔥 얼리버드 골프",
        productIds: [],
    });

    const [onsenCfg, setOnsenCfg] = useState<HomeSectionConfig>({
        enabled: true,
        title: "골프여행, 고르기 어려울 땐 🤔 ?",
        productIds: [],
        tags: ["오키나와", "시내호텔", "가성비", "프리미엄"],
    });

    // ✅ 태그 input의 “입력 원문” 상태 (IME 안전)
    const [onsenTagsText, setOnsenTagsText] = useState<string>("오키나와,시내호텔,가성비,프리미엄");

    useEffect(() => {
        if (specialQ.data) setSpecialCfg(specialQ.data);
    }, [specialQ.data]);

    useEffect(() => {
        if (onsenQ.data) {
            setOnsenCfg(onsenQ.data);
            setOnsenTagsText((onsenQ.data.tags ?? []).join(","));
        }
    }, [onsenQ.data]);

    const loading = productsQ.isLoading || specialQ.isLoading || onsenQ.isLoading;

    return (
        <div className="space-y-6">
            <div>
                <div className="text-lg font-extrabold text-neutral-100">홈 섹션 관리</div>
                <div className="text-sm text-neutral-400">홈 화면의 2개 섹션 문구/노출/상품 노출을 제어합니다.</div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-6 text-sm text-neutral-300">불러오는 중...</div>
            ) : null}

            <SectionEditor
                title="① 특가(상단) 섹션"
                cfg={specialCfg}
                setCfg={setSpecialCfg}
                products={published}
                saving={saveSpecial.isPending}
                onSave={() => saveSpecial.mutate(specialCfg)}
            />

            <SectionEditor
                title="② 추천/온천(하단) 섹션"
                cfg={onsenCfg}
                setCfg={setOnsenCfg}
                products={published}
                saving={saveOnsen.isPending}
                extraTags
                tagsText={onsenTagsText}
                setTagsText={setOnsenTagsText}
                onSave={() => {
                    // ✅ 저장 시에도 tags를 확정 반영
                    const next = { ...onsenCfg, tags: parseTags(onsenTagsText) };
                    setOnsenCfg(next);
                    saveOnsen.mutate(next);
                }}
            />
        </div>
    );
}
