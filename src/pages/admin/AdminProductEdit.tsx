import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
    Departure,
    DepartStatus,
    ItineraryDay,
    ItineraryRow,
    MealType,
    OfferType,
    ProductStatus,
    ProductUpsert,
} from "../../types/product";

import { createProduct, getProduct, updateProduct, uid } from "../../api/products.api";

/* ---------------- tabs ---------------- */
type TabKey = "basic" | "bullets" | "itinerary" | "offers" | "assets";

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "basic", label: "기본정보" },
    { key: "bullets", label: "포함/불포함" },
    { key: "itinerary", label: "일정표" },
    { key: "offers", label: "출발일·오퍼" },
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
    return ["basic", "bullets", "itinerary", "offers", "assets"].includes(String(x));
}

/* ====================== MAIN ====================== */
export default function AdminProductEdit({ mode }: { mode: "create" | "edit" }) {
    const nav = useNavigate();
    const qc = useQueryClient();
    const params = useParams();

    const id = params.id ?? "";
    const tabParam = params.tab;
    const tab: TabKey = isTabKey(tabParam) ? tabParam : "basic";

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

    /* ---------- form ---------- */
    const [form, setForm] = useState<ProductUpsert>({
        title: "",
        subtitle: "",
        region: "일본",
        nights: 3,
        days: 4,
        status: "DRAFT",
        description: "",
        priceText: "상담 문의",
        thumbnailUrl: "",
        images: [],
        included: [],
        excluded: [],
        notices: [],
        itinerary: [],
        departures: [],
        // ✅ theme_id 이미 들어가 있다면 유지 (네 프로젝트에 맞게)
        // themeId: null,
    });

    useEffect(() => {
        if (mode === "edit") {
            (async () => {
                const p = await getProduct(id);
                if (!p) return;
                setForm({
                    title: p.title ?? "",
                    subtitle: p.subtitle ?? "",
                    region: p.region ?? "일본",
                    nights: p.nights ?? 3,
                    days: p.days ?? 4,
                    status: p.status ?? "DRAFT",
                    description: p.description ?? "",
                    priceText: p.priceText ?? "",
                    thumbnailUrl: p.thumbnailUrl ?? "",
                    images: p.images ?? [],
                    included: p.included ?? [],
                    excluded: p.excluded ?? [],
                    notices: p.notices ?? [],
                    itinerary: p.itinerary ?? [],
                    departures: p.departures ?? [],
                    // themeId: p.themeId ?? null,
                });
            })();
        }
    }, [mode, id]);

    /* ---------- save ---------- */
    const save = useMutation({
        mutationFn: async () => {
            if (mode === "create") return createProduct(form);
            return updateProduct(id, form);
        },
        onSuccess: async () => {
            // 리스트 캐시 무효화 + 화면도 갱신되도록
            await qc.invalidateQueries({ queryKey: ["admin-products"] });

            // ✅ 저장 후 무조건 리스트로 이동
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

                {/* ✅ PC Actions (저장/취소) */}
                <div className="hidden md:flex items-center gap-2">
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
                        className="rounded-xl bg-[#1C8B7B] px-4 py-2 text-sm font-extrabold text-white hover:brightness-95"
                    >
                        저장
                    </button>
                </div>
            </div>

            {/* ---------- tabs (mobile friendly) ---------- */}
            {/* ✅ 입력 막는 문제 방지(pointer-events 처리) */}
            <div className="sticky top-[56px] z-20 -mx-4 mt-4 bg-black/80 px-4 backdrop-blur pointer-events-none">
                <div className="flex gap-2 overflow-x-auto py-3 pointer-events-auto">
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
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input"
                                placeholder="예) 오키나와 3박4일 골프 패키지"
                            />
                        </Field>

                        <Field label="부제">
                            <input
                                value={form.subtitle}
                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                className="input"
                                placeholder="예) #1인1실 #온천 #시내호텔"
                            />
                        </Field>

                        {/* (테마 드롭다운은 이미 있다고 했으니 여기 추가 안함) */}

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="지역">
                                <select
                                    value={form.region}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    className="input"
                                >
                                    {REGIONS.map((x) => (
                                        <option key={x}>{x}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="상태">
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                                    className="input"
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
                                    value={form.nights}
                                    inputMode="numeric"
                                    onChange={(e) => setForm({ ...form, nights: clampInt(e.target.value) })}
                                    className="input"
                                />
                            </Field>
                            <Field label="일">
                                <input
                                    value={form.days}
                                    inputMode="numeric"
                                    onChange={(e) => setForm({ ...form, days: clampInt(e.target.value) })}
                                    className="input"
                                />
                            </Field>
                        </div>
                    </Section>
                )}

                {tab === "bullets" && (
                    <Section title="포함 / 불포함 / 참고">
                        <ListEditor title="포함" items={form.included} onChange={(v) => setForm({ ...form, included: v })} />
                        <ListEditor title="불포함" items={form.excluded} onChange={(v) => setForm({ ...form, excluded: v })} />
                        <ListEditor title="참고" items={form.notices} onChange={(v) => setForm({ ...form, notices: v })} />
                    </Section>
                )}

                {tab === "itinerary" && (
                    <Section title="일정표">
                        <ItineraryEditor days={form.itinerary ?? []} onChange={(v) => setForm({ ...form, itinerary: v })} />
                    </Section>
                )}

                {tab === "offers" && (
                    <Section title="출발일 · 오퍼">
                        <OffersEditor items={form.departures ?? []} onChange={(v) => setForm({ ...form, departures: v })} />
                    </Section>
                )}

                {tab === "assets" && (
                    <Section title="원본문서">
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-300">
                            다음 단계에서 문서 업로드 기능을 붙입니다.
                        </div>
                    </Section>
                )}
            </div>

            {/* ---------- mobile sticky actions ---------- */}
            <div className="sticky bottom-0 z-30 -mx-4 mt-8 bg-black/80 px-4 py-3 backdrop-blur md:hidden">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => nav("/admin/products")}
                        className="rounded-xl border border-neutral-800 py-3 text-sm font-bold text-neutral-200"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => save.mutate()}
                        className="rounded-xl bg-[#1C8B7B] py-3 text-sm font-extrabold text-white"
                    >
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

function ListEditor({
                        title,
                        items,
                        onChange,
                    }: {
    title: string;
    items: string[];
    onChange: (v: string[]) => void;
}) {
    const [draft, setDraft] = useState("");

    const addItem = () => {
        const v = draft.trim();
        if (!v) return;
        onChange([...(items ?? []), v]);
        setDraft("");
    };

    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-neutral-200">{title}</div>
                <button
                    type="button"
                    onClick={addItem}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-extrabold text-neutral-950"
                >
                    추가
                </button>
            </div>

            {/* ✅ 입력칸이 안 보이던 문제 해결: 높이/배경/테두리/placeholder 강화 */}
            <div className="mt-3">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addItem();
                        }
                    }}
                    placeholder={`${title} 항목을 입력하고 Enter 또는 '추가'를 누르세요`}
                    className="input h-11"
                />
            </div>

            <div className="mt-4 space-y-2">
                {(items ?? []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/20 p-4 text-sm text-neutral-500">
                        아직 등록된 항목이 없습니다.
                    </div>
                ) : (
                    (items ?? []).map((x, i) => (
                        <div
                            key={`${x}-${i}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/20 px-4 py-3"
                        >
                            <div className="min-w-0 text-sm text-neutral-200">{x}</div>
                            <button
                                type="button"
                                onClick={() => onChange((items ?? []).filter((_, idx) => idx !== i))}
                                className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-xs font-extrabold text-neutral-200 hover:bg-neutral-900"
                            >
                                삭제
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ====================== OFFERS (출발일/오퍼) ====================== */
function OffersEditor({ items, onChange }: { items: Departure[]; onChange: (v: Departure[]) => void }) {
    const add = () => {
        onChange([
            ...items,
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
        const next = [...items];
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const remove = (idx: number) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-3">
            {items.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                    아직 등록된 출발일이 없습니다. 아래 버튼으로 추가하세요.
                </div>
            ) : null}

            {items.map((d, i) => (
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
                        <button onClick={() => remove(i)} className="text-xs font-bold text-rose-400">
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
        const next = renumberDays(days.filter((_, i) => i !== idx));
        onChange(next);
    };

    const updateDay = (idx: number, patch: Partial<ItineraryDay>) => {
        const next = [...days];
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const addRow = (dayIdx: number) => {
        const next = [...days];
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
        const next = [...days];
        const rows = (next[dayIdx].rows ?? []).filter((_, i) => i !== rowIdx);
        next[dayIdx] = { ...next[dayIdx], rows };
        onChange(next);
    };

    const updateRow = (dayIdx: number, rowIdx: number, patch: Partial<ItineraryRow>) => {
        const next = [...days];
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
            {days.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-400">
                    아직 일정표가 없습니다. 아래 버튼으로 일차를 추가하세요.
                </div>
            ) : null}

            {days.map((d, di) => (
                <div key={d.id ?? di} className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 text-xs font-semibold text-neutral-400">일차 제목</div>
                            <input value={d.title ?? `${d.dayNo}일차`} onChange={(e) => updateDay(di, { title: e.target.value })} className="input" />
                        </div>
                        <button onClick={() => removeDay(di)} className="mt-6 text-xs font-bold text-rose-400">
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
                                    <button onClick={() => removeRow(di, ri)} className="text-xs font-bold text-rose-400">
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