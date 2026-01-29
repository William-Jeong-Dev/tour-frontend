import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import {
    adminCreateArea,
    adminDeleteArea,
    adminListAreas,
    adminUpdateArea,
    type AreaRow,
} from "../../api/areas.api";

type ThemeRow = { id: string; name: string; slug: string; sort_order?: number | null; is_active?: boolean | null };

function slugify(s: string) {
    return (s ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
}

export default function AdminAreas() {
    const qc = useQueryClient();

    // ✅ 테마 목록 (필터 + 생성용)
    const themesQuery = useQuery({
        queryKey: ["admin-themes-mini"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_themes")
                .select("id,name,slug,sort_order,is_active")
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return (data ?? []) as ThemeRow[];
        },
        staleTime: 60_000,
    });

    const [themeId, setThemeId] = useState<string>("");

    // ✅ 지역 리스트
    const areasQuery = useQuery({
        queryKey: ["admin-areas", themeId || "ALL"],
        queryFn: () => adminListAreas(themeId ? { themeId } : undefined),
        staleTime: 10_000,
    });

    // ✅ form (create/edit)
    const [editing, setEditing] = useState<AreaRow | null>(null);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [active, setActive] = useState(true);
    const [formThemeId, setFormThemeId] = useState("");

    useEffect(() => {
        if (!editing) {
            setName("");
            setSlug("");
            setSortOrder(0);
            setActive(true);
            setFormThemeId(themeId || "");
            return;
        }
        setName(editing.name ?? "");
        setSlug(editing.slug ?? "");
        setSortOrder(editing.sort_order ?? 0);
        setActive(editing.is_active !== false);
        setFormThemeId(editing.theme_id);
    }, [editing, themeId]);

    const themeName = useMemo(() => {
        const t = (themesQuery.data ?? []).find((x) => x.id === themeId);
        return t?.name ?? "전체 테마";
    }, [themesQuery.data, themeId]);

    const resetForm = () => {
        setFormThemeId("");
        setName("");
        setSlug("");
        setSortOrder(0);
        setActive(true); // 기본값 ON이면 true, OFF면 false로
    };

    const createMut = useMutation({
        mutationFn: () =>
            adminCreateArea({
                theme_id: formThemeId,
                name: name.trim(),
                slug: slug.trim(),
                sort_order: sortOrder,
                is_active: active,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-areas"] });
            resetForm();
        },
    });

    const updateMut = useMutation({
        mutationFn: () =>
            adminUpdateArea(editing!.id, {
                theme_id: formThemeId,
                name: name.trim(),
                slug: slug.trim(),
                sort_order: sortOrder,
                is_active: active,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-areas"] });
            setEditing(null);
        },
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => adminDeleteArea(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-areas"] }),
    });

    const canSubmit = !!formThemeId && !!name.trim() && !!slug.trim();

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-extrabold text-neutral-100">지역(product_area) 관리</div>
                    <div className="mt-1 text-xs text-neutral-400">테마 하위 지역(3depth)을 관리합니다.</div>
                </div>
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="text-sm font-bold text-neutral-200">테마 필터</div>
                <select
                    className="input max-w-[280px]"
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                >
                    <option value="">전체</option>
                    {(themesQuery.data ?? []).map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name} ({t.slug})
                        </option>
                    ))}
                </select>
                <div className="text-xs text-neutral-500">현재: {themeName}</div>
            </div>

            {/* 생성/수정 폼 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-neutral-100">
                        {editing ? "지역 수정" : "지역 추가"}
                    </div>
                    {editing ? (
                        <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-900"
                        >
                            취소
                        </button>
                    ) : null}
                </div>

                {/* ✅ 1행: 테마 / 이름 / slug */}
                <div className="mt-4 grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-4">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">테마</div>
                        <select
                            className="input w-full"
                            value={formThemeId}
                            onChange={(e) => setFormThemeId(e.target.value)}
                        >
                            <option value="">테마 선택</option>
                            {(themesQuery.data ?? []).map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">이름</div>
                        <input
                            className="input w-full"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!editing && !slug.trim()) setSlug(slugify(e.target.value));
                            }}
                            placeholder="예) 오키나와"
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">slug</div>
                        <input
                            className="input w-full"
                            value={slug}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                            placeholder="예) okinawa"
                        />
                    </div>
                </div>

                {/* ✅ 2행: 정렬 / 노출 / 추가(오른쪽) */}
                <div className="mt-3 grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6 md:col-span-2">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">정렬</div>
                        <input
                            className="input w-full"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value || 0))}
                        />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                        <div className="mb-1 text-xs font-semibold text-neutral-400">노출</div>
                        <button
                            type="button"
                            onClick={() => setActive((v) => !v)}
                            className={[
                                "w-full rounded-xl px-3 py-3 text-sm font-extrabold",
                                active
                                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-800"
                                    : "bg-neutral-900 text-neutral-300 border border-neutral-800",
                            ].join(" ")}
                        >
                            {active ? "ON" : "OFF"}
                        </button>
                    </div>

                    {/* ✅ 가운데 빈 공간(PC에서 버튼을 오른쪽으로 밀기 위한 스페이서) */}
                    <div className="hidden md:block md:col-span-6" />

                    <div className="col-span-12 md:col-span-2">
                        <button
                            type="button"
                            disabled={!canSubmit || createMut.isPending || updateMut.isPending}
                            onClick={() => (editing ? updateMut.mutate() : createMut.mutate())}
                            className={[
                                "w-full rounded-xl px-6 py-3 text-sm font-extrabold",
                                canSubmit
                                    ? "bg-[#2E97F2] text-white hover:brightness-95"
                                    : "bg-neutral-800 text-neutral-400 cursor-not-allowed",
                            ].join(" ")}
                        >
                            {editing ? "수정 저장" : "추가"}
                        </button>
                    </div>
                </div>
            </div>

            {/* 리스트 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="text-sm font-extrabold text-neutral-100">목록</div>

                {areasQuery.isLoading ? (
                    <div className="mt-4 text-sm text-neutral-400">불러오는 중...</div>
                ) : (areasQuery.data ?? []).length === 0 ? (
                    <div className="mt-4 text-sm text-neutral-400">지역이 없습니다.</div>
                ) : (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-900">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-950/60 text-neutral-300">
                            <tr>
                                <th className="px-4 py-3 text-left">테마</th>
                                <th className="px-4 py-3 text-left">정렬</th>
                                <th className="px-4 py-3 text-left">이름</th>
                                <th className="px-4 py-3 text-left">slug</th>
                                <th className="px-4 py-3 text-left">노출</th>
                                <th className="px-4 py-3 text-right">액션</th>
                            </tr>
                            </thead>
                            <tbody className="bg-black/20 text-neutral-200">
                            {(areasQuery.data ?? []).map((a) => {
                                const t = (themesQuery.data ?? []).find((x) => x.id === a.theme_id);
                                return (
                                    <tr key={a.id} className="border-t border-neutral-900">
                                        <td className="px-4 py-3">{t?.name ?? "-"}</td>
                                        <td className="px-4 py-3">{a.sort_order ?? 0}</td>
                                        <td className="px-4 py-3 font-bold">{a.name}</td>
                                        <td className="px-4 py-3 text-neutral-400">{a.slug}</td>
                                        <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-extrabold ${a.is_active !== false ? "bg-emerald-500/20 text-emerald-200" : "bg-neutral-800 text-neutral-300"}`}>
                          {a.is_active !== false ? "노출" : "숨김"}
                        </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(a)}
                                                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-900"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!confirm("삭제할까요?")) return;
                                                        deleteMut.mutate(a.id);
                                                    }}
                                                    className="rounded-xl border border-rose-900 bg-rose-950/20 px-3 py-2 text-sm font-bold text-rose-200 hover:bg-rose-950/40"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
