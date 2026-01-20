import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTheme,
    deleteTheme,
    listThemesAdmin,
    ThemeRow,
    ThemeUpsert,
    updateTheme,
} from "../../api/themes.api";

function slugifyKo(input: string) {
    // 아주 단순 slug: 공백 -> -, 나머지 그대로 (원하면 더 강하게 정제 가능)
    return input.trim().replace(/\s+/g, "-");
}

export default function AdminThemes() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState<ThemeRow | null>(null);

    const { data: themes, isLoading } = useQuery({
        queryKey: ["admin-themes"],
        queryFn: listThemesAdmin,
    });

    const onOpenCreate = () => {
        setEdit(null);
        setOpen(true);
    };

    const onOpenEdit = (t: ThemeRow) => {
        setEdit(t);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setEdit(null);
    };

    const del = useMutation({
        mutationFn: async (id: string) => {
            const ok = window.confirm("정말 삭제할까요? (상품의 theme_id는 null로 남을 수 있어요)");
            if (!ok) return false;
            return deleteTheme(id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-themes"] });
        },
    });

    const sorted = useMemo(() => themes ?? [], [themes]);

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-extrabold text-neutral-100">테마 관리</div>
                    <div className="mt-1 text-xs text-neutral-400">
                        상단 카테고리(일본 골프/온천 등)를 관리합니다.
                    </div>
                </div>

                <button
                    onClick={onOpenCreate}
                    className="rounded-xl bg-[#1C8B7B] px-4 py-2 text-sm font-extrabold text-white"
                >
                    + 테마 추가
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                {isLoading ? (
                    <div className="text-sm text-neutral-300">불러오는 중...</div>
                ) : sorted.length === 0 ? (
                    <div className="text-sm text-neutral-300">등록된 테마가 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-neutral-400">
                            <tr>
                                <th className="py-2">정렬</th>
                                <th className="py-2">이름</th>
                                <th className="py-2">slug</th>
                                <th className="py-2">노출</th>
                                <th className="py-2 text-right">액션</th>
                            </tr>
                            </thead>
                            <tbody className="text-neutral-200">
                            {sorted.map((t) => (
                                <tr key={t.id} className="border-t border-neutral-900">
                                    <td className="py-3">{t.sort_order}</td>
                                    <td className="py-3 font-bold">{t.name}</td>
                                    <td className="py-3 text-neutral-400">{t.slug}</td>
                                    <td className="py-3">
                                        {t.is_active ? (
                                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                          노출
                        </span>
                                        ) : (
                                            <span className="rounded-full bg-neutral-500/15 px-3 py-1 text-xs font-bold text-neutral-300">
                          비노출
                        </span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onOpenEdit(t)}
                                                className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => del.mutate(t.id)}
                                                className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-bold text-rose-300"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {open ? (
                <ThemeModal
                    initial={edit}
                    onClose={onClose}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ["admin-themes"] });
                        onClose();
                    }}
                />
            ) : null}
        </div>
    );
}

function ThemeModal({
                        initial,
                        onClose,
                        onSaved,
                    }: {
    initial: ThemeRow | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const qc = useQueryClient();
    const isEdit = !!initial;

    const [name, setName] = useState(initial?.name ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);
    const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);

    const save = useMutation({
        mutationFn: async () => {
            const payload: ThemeUpsert = {
                name: name.trim(),
                slug: slug.trim(),
                sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
                is_active: isActive,
            };

            if (!payload.name) throw new Error("이름을 입력하세요");
            if (!payload.slug) throw new Error("slug를 입력하세요");

            if (isEdit && initial) return updateTheme(initial.id, payload);
            return createTheme(payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-themes"] });
            onSaved();
        },
        onError: (e: any) => {
            alert(e?.message ?? "저장 실패");
        },
    });

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-neutral-100">
                        {isEdit ? "테마 수정" : "테마 추가"}
                    </div>
                    <button onClick={onClose} className="text-neutral-300">
                        ✕
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    <Field label="이름">
                        <input
                            value={name}
                            onChange={(e) => {
                                const v = e.target.value;
                                setName(v);
                                if (!isEdit && !slug.trim()) {
                                    setSlug(slugifyKo(v));
                                }
                            }}
                            className="input"
                            placeholder="예: 일본 골프"
                        />
                    </Field>

                    <Field label="slug (URL)">
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="input"
                            placeholder="예: japan-golf"
                        />
                        <div className="mt-1 text-[11px] text-neutral-500">
                            고객 페이지 URL: /theme/{slug || "slug"}
                        </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="정렬(sort_order)">
                            <input
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                                className="input"
                                inputMode="numeric"
                            />
                        </Field>

                        <Field label="노출 여부">
                            <select
                                value={isActive ? "true" : "false"}
                                onChange={(e) => setIsActive(e.target.value === "true")}
                                className="input"
                            >
                                <option value="true">노출</option>
                                <option value="false">비노출</option>
                            </select>
                        </Field>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1 text-xs font-semibold text-neutral-400">{label}</div>
            {children}
        </div>
    );
}
