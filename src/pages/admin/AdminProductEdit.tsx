import { useEffect, useMemo, useState } from "react";
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

type TabKey = "basic" | "bullets" | "itinerary" | "offers" | "assets";

const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "basic", label: "1) 기본정보" },
    { key: "bullets", label: "2) 포함/불포함/참고" },
    { key: "itinerary", label: "3) 일정표" },
    { key: "offers", label: "4) 출발일 + 오퍼" },
    { key: "assets", label: "5) 원본문서 업로드" },
];

const REGIONS = ["일본", "제주", "동남아", "유럽"] as const;
const STATUSES: Array<{ value: ProductStatus; label: string }> = [
    { value: "DRAFT", label: "임시저장" },
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
        itinerary: [
            {
                id: uid("day"),
                dayNo: 1,
                title: "1일차",
                dateText: "",
                rows: [
                    {
                        id: uid("row"),
                        place: "",
                        transport: "",
                        time: "",
                        content: "",
                        mealMorning: "NONE",
                        mealLunch: "NONE",
                        mealDinner: "NONE",
                    },
                ],
            },
        ],
        departures: [],
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
                    priceText: p.priceText ?? "상담 문의",
                    thumbnailUrl: p.thumbnailUrl ?? "",
                    images: Array.isArray(p.images) ? p.images : [],
                    included: Array.isArray(p.included) ? p.included : [],
                    excluded: Array.isArray(p.excluded) ? p.excluded : [],
                    notices: Array.isArray(p.notices) ? p.notices : [],
                    itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
                    departures: Array.isArray(p.departures) ? p.departures : [],
                });
            })();
        } else {
            setForm((f) => ({
                ...f,
                thumbnailUrl:
                    f.thumbnailUrl ||
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
            }));
        }
    }, [mode, id]);

    const title = useMemo(() => (mode === "create" ? "새 상품 등록" : "상품 수정"), [mode]);

    const save = useMutation({
        mutationFn: async () => {
            if (mode === "create") return createProduct(form);
            return updateProduct(id, form);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            qc.invalidateQueries({ queryKey: ["products"] });

            // ✅ 저장 후에는 상품 리스트로 돌아가기 (create/edit 공통)
            nav("/admin/products", { replace: true });
        },
    });

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-semibold">{title}</div>
                    <div className="mt-2 text-sm text-neutral-400">
                        탭은 URL로 관리됩니다. (새로고침/뒤로가기/링크 공유 OK)
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => nav("/admin/products")}
                        className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                    >
                        취소
                    </button>
                    <button
                        disabled={save.isPending}
                        onClick={() => save.mutate()}
                        className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {save.isPending ? "저장중..." : "저장"}
                    </button>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <TabButton key={t.key} active={tab === t.key} onClick={() => goTab(t.key)}>
                        {t.label}
                    </TabButton>
                ))}
            </div>

            <div className="mt-6">
                {tab === "basic" ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                            <Field label="제목">
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                />
                            </Field>

                            <Field label="부제">
                                <input
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                />
                            </Field>

                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="지역">
                                    <select
                                        value={form.region}
                                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                    >
                                        {REGIONS.map((x) => (
                                            <option key={x} value={x}>
                                                {x}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="박">
                                    <input
                                        value={form.nights}
                                        onChange={(e) => setForm({ ...form, nights: clampInt(e.target.value, 0) })}
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                    />
                                </Field>

                                <Field label="일">
                                    <input
                                        value={form.days}
                                        onChange={(e) => setForm({ ...form, days: clampInt(e.target.value, 0) })}
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                    />
                                </Field>
                            </div>

                            <Field label="상태">
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                >
                                    {STATUSES.map((x) => (
                                        <option key={x.value} value={x.value}>
                                            {x.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="대표 이미지 URL">
                                <input
                                    value={form.thumbnailUrl}
                                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                />
                            </Field>

                            <Field label="가격 텍스트(예: 97.9만 / 상담 문의)">
                                <input
                                    value={form.priceText}
                                    onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                />
                            </Field>
                        </div>

                        <div className="space-y-3">
                            <Field label="상품 소개(텍스트)">
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="min-h-[340px] w-full rounded-2xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                                />
                            </Field>
                        </div>
                    </div>
                ) : null}

                {tab === "bullets" ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <ListEditor
                            title="포함사항"
                            items={form.included}
                            placeholder="예) 호텔 숙박(조식 포함)"
                            onChange={(next) => setForm({ ...form, included: next })}
                        />
                        <ListEditor
                            title="불포함사항"
                            items={form.excluded}
                            placeholder="예) 왕복 항공권"
                            onChange={(next) => setForm({ ...form, excluded: next })}
                        />
                        <ListEditor
                            title="참고사항"
                            items={form.notices}
                            placeholder="예) 현지 사정에 따라 일정이 변경될 수 있습니다."
                            onChange={(next) => setForm({ ...form, notices: next })}
                        />
                    </div>
                ) : null}

                {tab === "itinerary" ? (
                    <ItineraryEditor value={form.itinerary} onChange={(next) => setForm({ ...form, itinerary: next })} />
                ) : null}

                {tab === "offers" ? (
                    <OffersEditor value={form.departures} onChange={(next) => setForm({ ...form, departures: next })} />
                ) : null}

                {tab === "assets" ? (
                    <ComingSoon
                        title="원본문서 업로드"
                        desc="다음 단계에서 문서(PDF/이미지) 업로드 → 링크 저장 방식으로 붙입니다."
                    />
                ) : null}
            </div>
        </div>
    );
}

// ---------- UI bits ----------
function TabButton({
                       active,
                       children,
                       onClick,
                   }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "rounded-full px-4 py-2 text-sm font-bold transition",
                active ? "bg-neutral-50 text-neutral-950" : "bg-neutral-950/40 text-neutral-200 hover:bg-neutral-900",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-2 text-sm text-neutral-300">{label}</div>
            {children}
        </div>
    );
}

function ListEditor({
                        title,
                        items,
                        placeholder,
                        onChange,
                    }: {
    title: string;
    items: string[];
    placeholder: string;
    onChange: (next: string[]) => void;
}) {
    const [draft, setDraft] = useState("");

    const add = () => {
        const v = draft.trim();
        if (!v) return;
        onChange([...items, v]);
        setDraft("");
    };

    const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

    return (
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-4">
            <div className="text-sm font-semibold text-neutral-200">{title}</div>

            <div className="mt-3 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                />
                <button
                    type="button"
                    onClick={add}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                >
                    추가
                </button>
            </div>

            <div className="mt-4 space-y-2">
                {items.map((x, i) => (
                    <div
                        key={`${x}-${i}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-neutral-900 bg-neutral-950/30 px-3 py-2"
                    >
                        <div className="min-w-0 text-sm text-neutral-200">{x}</div>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="shrink-0 rounded-lg border border-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-900"
                        >
                            삭제
                        </button>
                    </div>
                ))}
                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-800 p-4 text-sm text-neutral-400">
                        항목이 없습니다.
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ComingSoon({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-6">
            <div className="text-base font-semibold text-neutral-200">{title}</div>
            <div className="mt-2 text-sm text-neutral-400">{desc}</div>
        </div>
    );
}

// ---------- Itinerary Editor ----------
const MEAL_OPTIONS: Array<{ value: MealType; label: string }> = [
    { value: "NONE", label: "-" },
    { value: "HOTEL", label: "호텔식" },
    { value: "INCLUDED", label: "포함" },
    { value: "EXCLUDED", label: "불포함" },
    { value: "FREE", label: "자유" },
];

function ItineraryEditor({ value, onChange }: { value: ItineraryDay[]; onChange: (next: ItineraryDay[]) => void }) {
    const addDay = () => {
        const nextNo = (value?.length ?? 0) + 1;
        const day: ItineraryDay = {
            id: uid("day"),
            dayNo: nextNo,
            title: `${nextNo}일차`,
            dateText: "",
            rows: [
                {
                    id: uid("row"),
                    place: "",
                    transport: "",
                    time: "",
                    content: "",
                    mealMorning: "NONE",
                    mealLunch: "NONE",
                    mealDinner: "NONE",
                },
            ],
        };
        onChange([...(value ?? []), day]);
    };

    const removeDay = (dayId: string) => {
        const next = (value ?? [])
            .filter((d) => d.id !== dayId)
            .map((d, idx) => ({ ...d, dayNo: idx + 1, title: `${idx + 1}일차` }));
        onChange(next);
    };

    const updateDay = (dayId: string, patch: Partial<ItineraryDay>) => {
        onChange((value ?? []).map((d) => (d.id === dayId ? { ...d, ...patch } : d)));
    };

    const addRow = (dayId: string) => {
        onChange(
            (value ?? []).map((d) => {
                if (d.id !== dayId) return d;
                const row: ItineraryRow = {
                    id: uid("row"),
                    place: "",
                    transport: "",
                    time: "",
                    content: "",
                    mealMorning: "NONE",
                    mealLunch: "NONE",
                    mealDinner: "NONE",
                };
                return { ...d, rows: [...(d.rows ?? []), row] };
            })
        );
    };

    const removeRow = (dayId: string, rowId: string) => {
        onChange(
            (value ?? []).map((d) => {
                if (d.id !== dayId) return d;
                return { ...d, rows: (d.rows ?? []).filter((r) => r.id !== rowId) };
            })
        );
    };

    const updateRow = (dayId: string, rowId: string, patch: Partial<ItineraryRow>) => {
        onChange(
            (value ?? []).map((d) => {
                if (d.id !== dayId) return d;
                return { ...d, rows: (d.rows ?? []).map((r) => (r.id === rowId ? { ...r, ...patch } : r)) };
            })
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-200">일정표</div>
                <button
                    type="button"
                    onClick={addDay}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                >
                    + 일차 추가
                </button>
            </div>

            {(value ?? []).map((day) => (
                <div key={day.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="일차 제목">
                                <input
                                    value={day.title ?? ""}
                                    onChange={(e) => updateDay(day.id, { title: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                                />
                            </Field>
                            <Field label="날짜 텍스트(옵션)">
                                <input
                                    value={day.dateText ?? ""}
                                    onChange={(e) => updateDay(day.id, { dateText: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                                />
                            </Field>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeDay(day.id)}
                            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                        >
                            일차 삭제
                        </button>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-900">
                        <table className="min-w-[980px] w-full text-left text-xs">
                            <thead className="bg-neutral-950/40 text-neutral-300">
                            <tr>
                                <th className="px-3 py-2 w-[160px]">장소</th>
                                <th className="px-3 py-2 w-[120px]">교통</th>
                                <th className="px-3 py-2 w-[100px]">시간</th>
                                <th className="px-3 py-2">내용</th>
                                <th className="px-3 py-2 w-[90px]">조식</th>
                                <th className="px-3 py-2 w-[90px]">중식</th>
                                <th className="px-3 py-2 w-[90px]">석식</th>
                                <th className="px-3 py-2 w-[90px]"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                            {(day.rows ?? []).map((row) => (
                                <tr key={row.id} className="align-top text-neutral-200">
                                    <td className="px-3 py-2">
                                        <input
                                            value={row.place ?? ""}
                                            onChange={(e) => updateRow(day.id, row.id, { place: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            value={row.transport ?? ""}
                                            onChange={(e) =>
                                                updateRow(day.id, row.id, { transport: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            value={row.time ?? ""}
                                            onChange={(e) => updateRow(day.id, row.id, { time: e.target.value })}
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                            <textarea
                                                value={row.content ?? ""}
                                                onChange={(e) =>
                                                    updateRow(day.id, row.id, { content: e.target.value })
                                                }
                                                className="min-h-[44px] w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                            />
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.mealMorning}
                                            onChange={(e) =>
                                                updateRow(day.id, row.id, { mealMorning: e.target.value as MealType })
                                            }
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        >
                                            {MEAL_OPTIONS.map((x) => (
                                                <option key={x.value} value={x.value}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.mealLunch}
                                            onChange={(e) =>
                                                updateRow(day.id, row.id, { mealLunch: e.target.value as MealType })
                                            }
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        >
                                            {MEAL_OPTIONS.map((x) => (
                                                <option key={x.value} value={x.value}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.mealDinner}
                                            onChange={(e) =>
                                                updateRow(day.id, row.id, { mealDinner: e.target.value as MealType })
                                            }
                                            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                        >
                                            {MEAL_OPTIONS.map((x) => (
                                                <option key={x.value} value={x.value}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(day.id, row.id)}
                                            className="rounded-lg border border-neutral-800 px-2 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                                        >
                                            행 삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => addRow(day.id)}
                            className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                        >
                            + 행 추가
                        </button>
                    </div>
                </div>
            ))}

            {(value ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
                    일정표가 없습니다.
                </div>
            ) : null}
        </div>
    );
}

// ---------- Offers Editor ----------
const OFFER_TYPES: Array<{ value: OfferType; label: string }> = [
    { value: "NORMAL", label: "기본" },
    { value: "EVENT", label: "이벤트" },
    { value: "SPECIAL", label: "특가" },
];

const DEPART_STATUSES: Array<{ value: DepartStatus; label: string }> = [
    { value: "AVAILABLE", label: "예약가능" },
    { value: "CONFIRMED", label: "출발확정" },
    { value: "INQUIRY", label: "가격문의" },
];

function OffersEditor({ value, onChange }: { value: Departure[]; onChange: (next: Departure[]) => void }) {
    const add = () => {
        const d: Departure = {
            id: uid("dep"),
            dateISO: new Date().toISOString().slice(0, 10),
            offerType: "NORMAL",
            status: "AVAILABLE",
            priceAdult: 0,
            remain: 0,
            min: 1,
            max: 0,
            note: "",
        };
        onChange([...(value ?? []), d]);
    };

    const remove = (depId: string) => onChange((value ?? []).filter((x) => x.id !== depId));

    const update = (depId: string, patch: Partial<Departure>) => {
        onChange((value ?? []).map((x) => (x.id === depId ? { ...x, ...patch } : x)));
    };

    const sorted = useMemo(() => {
        const list = [...(value ?? [])];
        list.sort((a, b) => {
            if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
            if (a.offerType !== b.offerType) return a.offerType.localeCompare(b.offerType);
            return (a.priceAdult ?? 0) - (b.priceAdult ?? 0);
        });
        return list;
    }, [value]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-200">출발일 + 오퍼</div>
                <button
                    type="button"
                    onClick={add}
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                >
                    + 출발 옵션 추가
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-900">
                <table className="min-w-[980px] w-full text-left text-xs">
                    <thead className="bg-neutral-950/40 text-neutral-300">
                    <tr>
                        <th className="px-3 py-2 w-[150px]">출발일</th>
                        <th className="px-3 py-2 w-[140px]">오퍼</th>
                        <th className="px-3 py-2 w-[140px]">상태</th>
                        <th className="px-3 py-2 w-[140px]">성인가</th>
                        <th className="px-3 py-2 w-[120px]">잔여</th>
                        <th className="px-3 py-2 w-[120px]">최소</th>
                        <th className="px-3 py-2 w-[120px]">최대</th>
                        <th className="px-3 py-2">메모</th>
                        <th className="px-3 py-2 w-[90px]"></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                    {sorted.map((d) => (
                        <tr key={d.id} className="align-top text-neutral-200">
                            <td className="px-3 py-2">
                                <input
                                    value={d.dateISO}
                                    onChange={(e) => update(d.id, { dateISO: e.target.value })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <select
                                    value={d.offerType}
                                    onChange={(e) => update(d.id, { offerType: e.target.value as OfferType })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                >
                                    {OFFER_TYPES.map((x) => (
                                        <option key={x.value} value={x.value}>
                                            {x.label}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-3 py-2">
                                <select
                                    value={d.status}
                                    onChange={(e) => update(d.id, { status: e.target.value as DepartStatus })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                >
                                    {DEPART_STATUSES.map((x) => (
                                        <option key={x.value} value={x.value}>
                                            {x.label}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-3 py-2">
                                <input
                                    value={d.priceAdult ?? 0}
                                    onChange={(e) => update(d.id, { priceAdult: clampInt(e.target.value, 0) })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <input
                                    value={d.remain ?? 0}
                                    onChange={(e) => update(d.id, { remain: clampInt(e.target.value, 0) })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <input
                                    value={d.min ?? 1}
                                    onChange={(e) => update(d.id, { min: clampInt(e.target.value, 0) })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <input
                                    value={d.max ?? 0}
                                    onChange={(e) => update(d.id, { max: clampInt(e.target.value, 0) })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <input
                                    value={d.note ?? ""}
                                    onChange={(e) => update(d.id, { note: e.target.value })}
                                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-2 outline-none"
                                />
                            </td>
                            <td className="px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => remove(d.id)}
                                    className="rounded-lg border border-neutral-800 px-2 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {(value ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 p-6 text-sm text-neutral-400">
                    출발 옵션이 없습니다.
                </div>
            ) : null}
        </div>
    );
}
