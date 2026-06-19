import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTheme,
    deleteTheme,
    listThemesAdmin,
    ThemeRow,
    ThemeUpsert,
    ThemeFaq,
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
                    className="rounded-xl bg-[#2E97F2] px-4 py-2 text-sm font-extrabold text-white"
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
    const [introTitle, setIntroTitle] = useState(initial?.intro_title ?? "");
    const [introBody, setIntroBody] = useState(initial?.intro_body ?? "");
    const [faq, setFaq] = useState<ThemeFaq[]>(initial?.faq ?? []);

    const addFaq = () => setFaq((prev) => [...prev, { question: "", answer: "" }]);
    const removeFaq = (idx: number) =>
        setFaq((prev) => prev.filter((_, i) => i !== idx));
    const updateFaq = (idx: number, key: keyof ThemeFaq, value: string) =>
        setFaq((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));

    const save = useMutation({
        mutationFn: async () => {
            // FAQ: 질문/답변 둘 다 비어있는 행은 제거하고 trim
            const cleanFaq = faq
                .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
                .filter((f) => f.question || f.answer);

            const payload: ThemeUpsert = {
                name: name.trim(),
                slug: slug.trim(),
                sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
                is_active: isActive,
                intro_title: introTitle.trim() || null,
                intro_body: introBody.trim() || null,
                faq: cleanFaq,
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-8">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-neutral-100">
                        {isEdit ? "테마 수정" : "테마 추가"}
                    </div>
                    <button onClick={onClose} className="text-neutral-300">
                        ✕
                    </button>
                </div>

                <div className="mt-4 space-y-3 overflow-y-auto pr-1">
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

                    {/* 테마 페이지 상단 안내 문구 */}
                    <div className="border-t border-neutral-900 pt-3">
                        <div className="text-xs font-extrabold text-neutral-200">페이지 안내 문구</div>
                        <div className="mt-1 text-[11px] text-neutral-500">
                            테마 페이지(/theme/{slug || "slug"}) 상단에 표시됩니다. 비워두면 표시되지 않습니다.
                        </div>
                    </div>

                    <Field label="안내 제목">
                        <input
                            value={introTitle}
                            onChange={(e) => setIntroTitle(e.target.value)}
                            className="input"
                            placeholder="예: 일본 골프여행 안내"
                        />
                    </Field>

                    <Field label="안내 본문">
                        <textarea
                            value={introBody}
                            onChange={(e) => setIntroBody(e.target.value)}
                            className="input min-h-[96px] resize-y"
                            placeholder="예: 일본 골프여행은 규슈, 사가, 구마모토, 후쿠오카 등 다양한 지역에서…"
                        />
                    </Field>

                    {/* FAQ (SEO 구조화데이터 / FAQPage) */}
                    <div className="border-t border-neutral-900 pt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-extrabold text-neutral-200">FAQ (SEO)</div>
                                <div className="mt-1 text-[11px] text-neutral-500">
                                    검색엔진 구조화데이터(FAQPage)로 사용됩니다. 화면에는 노출되지 않습니다.
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addFaq}
                                className="shrink-0 rounded-lg border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-200"
                            >
                                + 질문 추가
                            </button>
                        </div>

                        <div className="mt-3 space-y-3">
                            {faq.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-neutral-800 px-3 py-4 text-center text-[11px] text-neutral-500">
                                    등록된 FAQ가 없습니다.
                                </div>
                            ) : (
                                faq.map((f, idx) => (
                                    <div
                                        key={idx}
                                        className="space-y-2 rounded-xl border border-neutral-900 bg-neutral-950/40 p-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-[11px] font-bold text-neutral-400">
                                                Q{idx + 1}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFaq(idx)}
                                                className="text-[11px] font-bold text-rose-300"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <input
                                            value={f.question}
                                            onChange={(e) => updateFaq(idx, "question", e.target.value)}
                                            className="input"
                                            placeholder="질문 (예: 일본 골프 여행은 어떻게 예약하나요?)"
                                        />
                                        <textarea
                                            value={f.answer}
                                            onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                                            className="input min-h-[64px] resize-y"
                                            placeholder="답변"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid shrink-0 grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-neutral-800 py-3 text-sm font-bold text-neutral-200"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => save.mutate()}
                        className="rounded-xl bg-[#2E97F2] py-3 text-sm font-extrabold text-white"
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
