import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    adminCreatePopup,
    adminDeletePopup,
    adminListPopups,
    adminUpdatePopup,
    uploadPopupImage,
    type PopupRow,
} from "../../api/popups.api";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

/** datetime-local helper */
function toLocalInputValue(iso: string | null | undefined) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function fromLocalInputValue(v: string) {
    if (!v) return null;
    return new Date(v).toISOString();
}

/** Draft 타입: 신규는 id=null */
type PopupDraft = Omit<PopupRow, "id"> & { id: string | null };

function toDraft(row: PopupRow): PopupDraft {
    return { ...row, id: row.id };
}

function createEmptyDraft(): PopupDraft {
    const now = new Date().toISOString();
    return {
        id: null,
        title: "",
        is_active: true,
        left_px: 0,
        top_px: 0,
        width_px: 400,
        content_html: "",
        start_at: null,
        end_at: null,
        sort_order: 0,
        created_at: now,
        updated_at: now,
    };
}

export default function AdminPopupsPage() {
    const qc = useQueryClient();

    /** 목록 */
    const listQ = useQuery({
        queryKey: ["admin-popups"],
        queryFn: adminListPopups,
        staleTime: 30_000,
    });

    const popups = listQ.data ?? [];

    /** 선택 */
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = useMemo(
        () => popups.find((p) => p.id === selectedId) ?? null,
        [popups, selectedId]
    );

    /** 초기에 하나 자동 선택(단, draft가 신규 작성중이면 건드리지 않음) */
    const [draft, setDraft] = useState<PopupDraft | null>(null);
    const isCreating = draft?.id === null; // 신규 작성중

    useEffect(() => {
        if (isCreating) return;
        if (!selectedId && popups.length > 0) setSelectedId(popups[0].id);
    }, [popups, selectedId, isCreating]);

    /** selected -> draft 동기화 (단, 신규 작성중이면 유지) */
    useEffect(() => {
        if (isCreating) return;
        if (!selected) return;

        setDraft((prev) => {
            if (prev?.id === selected.id) return prev; // 같은거 편집중이면 유지
            return toDraft(selected);
        });
    }, [selected, isCreating]);

    /** TipTap */
    const editor = useEditor({
        extensions: [StarterKit, Image],
        content: draft?.content_html ?? "",
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setDraft((prev) => (prev ? { ...prev, content_html: html } : prev));
        },
        editorProps: {
            handlePaste: (_view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (const item of items) {
                    if (item.type.startsWith("image/")) {
                        const file = item.getAsFile();
                        if (!file) continue;

                        (async () => {
                            try {
                                const url = await uploadPopupImage(file);
                                editor?.chain().focus().setImage({ src: url }).run();
                            } catch (e) {
                                console.error("[POPUPS] paste image upload failed", e);
                            }
                        })();

                        event.preventDefault();
                        return true;
                    }
                }
                return false;
            },
        },
    });

    /** draft.id 변경 시 에디터 컨텐츠 동기화 */
    useEffect(() => {
        if (!editor) return;
        if (!draft) return;

        const cur = editor.getHTML();
        const next = draft.content_html ?? "";
        if (cur !== next) editor.commands.setContent(next);
    }, [draft?.id, editor]); // ✅ id 기준으로만

    /** 저장(create/update 분기) */
    const saveM = useMutation({
        mutationFn: async () => {
            if (!draft) return;

            const payload = {
                title: draft.title,
                is_active: draft.is_active,
                left_px: draft.left_px,
                top_px: draft.top_px,
                width_px: draft.width_px,
                content_html: draft.content_html,
                start_at: draft.start_at,
                end_at: draft.end_at,
                sort_order: draft.sort_order,
            };

            // 신규
            if (!draft.id) {
                return await adminCreatePopup(payload);
            }
            // 수정
            return await adminUpdatePopup(draft.id, payload);
        },
        onSuccess: async (saved) => {
            await qc.invalidateQueries({ queryKey: ["admin-popups"] });

            // ✅ 저장 성공하면 그 row를 그대로 선택/편집 상태로 유지
            if (saved?.id) {
                setSelectedId(saved.id);
                setDraft(toDraft(saved as PopupRow));
                editor?.commands.setContent((saved as any).content_html ?? "");
            }
        },
        onError: (e) => {
            console.error("[POPUPS] save failed", e);
        },
    });

    /** 삭제 */
    const deleteM = useMutation({
        mutationFn: async (id: string) => {
            return await adminDeletePopup(id);
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["admin-popups"] });
            setSelectedId(null);
            setDraft(null);
            editor?.commands.setContent("");
        },
    });

    if (listQ.isLoading) return <div className="text-neutral-200">불러오는 중...</div>;

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* 좌측 리스트 */}
            <div className="col-span-12 md:col-span-4 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-neutral-100">팝업 관리</div>

                    {/* ✅ +추가 : DB insert가 아니라, 빈 draft를 열기만 한다 */}
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedId(null);
                            const empty = createEmptyDraft();
                            setDraft(empty);
                            editor?.commands.setContent("");
                        }}
                        className="rounded-xl bg-[#2E97F2] px-3 py-2 text-sm font-extrabold text-white"
                    >
                        + 추가
                    </button>
                </div>

                <div className="mt-4 space-y-2">
                    {popups.length === 0 ? (
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-sm text-neutral-400">
                            아직 등록된 팝업이 없습니다. <span className="font-bold">+ 추가</span>로 생성하세요.
                        </div>
                    ) : null}

                    {popups.map((p) => {
                        const active = p.id === selectedId && !isCreating;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedId(p.id)}
                                className={[
                                    "w-full rounded-xl border px-3 py-3 text-left",
                                    active ? "border-[#2E97F2] bg-[#2E97F2]/10" : "border-neutral-800 bg-neutral-950/30",
                                ].join(" ")}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-neutral-100">{p.title || "(제목 없음)"}</div>
                                    <span className={`text-xs font-bold ${p.is_active ? "text-emerald-300" : "text-neutral-500"}`}>
                    {p.is_active ? "ON" : "OFF"}
                  </span>
                                </div>
                                <div className="mt-1 text-xs text-neutral-500">
                                    left {p.left_px}px · top {p.top_px}px · width {p.width_px}px · sort {p.sort_order ?? 0}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 우측 편집 */}
            <div className="col-span-12 md:col-span-8 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                {!draft ? (
                    <div className="text-neutral-400">팝업을 선택하거나 +추가로 새 팝업을 만드세요.</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-lg font-extrabold text-neutral-100">
                                {draft.id ? "팝업 편집" : "새 팝업 생성"}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* 삭제는 기존 row일 때만 */}
                                {draft.id ? (
                                    <button
                                        type="button"
                                        onClick={() => deleteM.mutate(draft.id!)}
                                        disabled={deleteM.isPending}
                                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-bold text-rose-300 disabled:opacity-50"
                                    >
                                        {deleteM.isPending ? "삭제 중..." : "삭제"}
                                    </button>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log("[POPUPS] 저장 클릭", draft);
                                        saveM.mutate();
                                    }}
                                    disabled={saveM.isPending || !draft}
                                    className="rounded-xl bg-[#2E97F2] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
                                >
                                    {saveM.isPending ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>

                        {/* 저장 에러/성공 메시지 */}
                        {saveM.isError ? (
                            <div className="mt-2 text-xs font-bold text-rose-300">
                                저장 실패: {(saveM.error as any)?.message ?? "unknown"}
                            </div>
                        ) : null}
                        {saveM.isSuccess ? (
                            <div className="mt-2 text-xs font-bold text-emerald-300">저장 완료</div>
                        ) : null}

                        <div className="mt-4 grid grid-cols-12 gap-3">
                            {/* 제목 */}
                            <div className="col-span-12 md:col-span-8">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">제목</div>
                                <input
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>

                            {/* 노출 */}
                            <div className="col-span-12 md:col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">노출</div>
                                <button
                                    type="button"
                                    onClick={() => setDraft({ ...draft, is_active: !draft.is_active })}
                                    className={[
                                        "w-full rounded-xl px-3 py-3 text-sm font-extrabold",
                                        draft.is_active
                                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-700/40"
                                            : "bg-neutral-900 text-neutral-300 border border-neutral-800",
                                    ].join(" ")}
                                >
                                    {draft.is_active ? "ON" : "OFF"}
                                </button>
                            </div>

                            {/* LEFT/TOP/WIDTH */}
                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">LEFT(px)</div>
                                <input
                                    type="number"
                                    value={draft.left_px}
                                    onChange={(e) => setDraft({ ...draft, left_px: Number(e.target.value || 0) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>
                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">TOP(px)</div>
                                <input
                                    type="number"
                                    value={draft.top_px}
                                    onChange={(e) => setDraft({ ...draft, top_px: Number(e.target.value || 0) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>
                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">WIDTH(px)</div>
                                <input
                                    type="number"
                                    value={draft.width_px}
                                    onChange={(e) => setDraft({ ...draft, width_px: Number(e.target.value || 0) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>

                            {/* sort / start / end */}
                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">정렬(sort_order)</div>
                                <input
                                    type="number"
                                    value={draft.sort_order ?? 0}
                                    onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value || 0) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>

                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">시작일</div>
                                <input
                                    type="datetime-local"
                                    value={toLocalInputValue(draft.start_at)}
                                    onChange={(e) => setDraft({ ...draft, start_at: fromLocalInputValue(e.target.value) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>

                            <div className="col-span-4">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">종료일</div>
                                <input
                                    type="datetime-local"
                                    value={toLocalInputValue(draft.end_at)}
                                    onChange={(e) => setDraft({ ...draft, end_at: fromLocalInputValue(e.target.value) })}
                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-3 text-sm text-neutral-100 outline-none"
                                />
                            </div>

                            {/* 내용 */}
                            <div className="col-span-12">
                                <div className="mb-1 text-xs font-semibold text-neutral-400">내용 (텍스트/이미지 복붙 가능)</div>
                                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3">
                                    <EditorContent editor={editor} className="prose prose-invert max-w-none min-h-[360px]" />
                                    <div className="mt-2 text-xs text-neutral-500">
                                        이미지 복사(Ctrl+C) 후 붙여넣기(Ctrl+V)하면 site-assets/popup에 업로드 후 자동 삽입됩니다.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}