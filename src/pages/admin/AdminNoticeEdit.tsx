import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Container from "../../components/common/Container";
import { useSession } from "../../hooks/useSession";
import { isAdmin } from "../../api/admin.api";
import { createNotice, deleteNotice, getNotice, updateNotice } from "../../api/notices.api";

export default function AdminNoticeEdit({ mode }: { mode: "create" | "edit" }) {
    const nav = useNavigate();
    const qc = useQueryClient();
    const { id } = useParams();

    const { session, loading } = useSession();
    const userId = session?.user?.id ?? null;

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("일반");
    const [isPinned, setIsPinned] = useState(false);
    const [isPublished, setIsPublished] = useState(true);
    const [content, setContent] = useState("");

    // guard
    useEffect(() => {
        const run = async () => {
            if (loading) return;
            if (!userId) return;
            const ok = await isAdmin(userId);
            if (!ok) nav("/", { replace: true });
        };
        run();
    }, [loading, userId, nav]);

    const detailQuery = useQuery({
        queryKey: ["adminNotice", id],
        queryFn: () => getNotice(String(id)),
        enabled: mode === "edit" && !!id,
    });

    useEffect(() => {
        if (mode !== "edit") return;
        const n = detailQuery.data;
        if (!n) return;

        setTitle(n.title ?? "");
        setCategory(n.category ?? "일반");
        setIsPinned(!!n.is_pinned);
        setIsPublished(!!n.is_published);
        setContent(n.content ?? "");
    }, [mode, detailQuery.data]);

    const saveMut = useMutation({
        mutationFn: async () => {
            if (!title.trim()) throw new Error("제목을 입력해주세요.");
            if (!content.trim()) throw new Error("내용을 입력해주세요.");

            if (mode === "create") {
                const created = await createNotice({
                    title: title.trim(),
                    content,
                    category,
                    is_pinned: isPinned,
                    is_published: isPublished,
                });
                return { id: created.id };
            }

            await updateNotice(String(id), {
                title: title.trim(),
                content,
                category,
                is_pinned: isPinned,
                is_published: isPublished,
            });
            return { id: String(id) };
        },
        onSuccess: async (res) => {
            await qc.invalidateQueries({ queryKey: ["adminNotices"] });
            await qc.invalidateQueries({ queryKey: ["adminNotice"] });
            nav(`/admin/notices/${res.id}`, { replace: true });
        },
    });

    const delMut = useMutation({
        mutationFn: () => deleteNotice(String(id)),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["adminNotices"] });
            nav("/admin/notices", { replace: true });
        },
    });

    if (loading) return null;
    if (!session) return null;

    const isEdit = mode === "edit";

    return (
        <main className="bg-transparent">
            <Container>
                <div className="py-10 text-neutral-100">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold">{isEdit ? "공지 수정" : "공지 작성"}</h1>
                            <p className="mt-2 text-sm text-neutral-400">클라이언트 /notices 에 노출됩니다.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/admin/notices"
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900"
                            >
                                목록
                            </Link>

                            {isEdit ? (
                                <button
                                    type="button"
                                    className="rounded-xl border border-rose-800/60 bg-rose-500/10 px-4 py-2 text-sm font-extrabold text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                                    disabled={delMut.isPending}
                                    onClick={() => {
                                        const ok = confirm("정말 삭제할까요?");
                                        if (!ok) return;
                                        delMut.mutate();
                                    }}
                                >
                                    삭제
                                </button>
                            ) : null}

                            <button
                                type="button"
                                className="rounded-xl bg-[#2E97F2] px-4 py-2 text-sm font-extrabold text-white hover:brightness-110 disabled:opacity-60"
                                disabled={saveMut.isPending}
                                onClick={() => saveMut.mutate()}
                            >
                                저장
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-6">
                        {isEdit && detailQuery.isLoading ? (
                            <div className="text-sm text-neutral-400">불러오는 중...</div>
                        ) : isEdit && detailQuery.isError ? (
                            <div className="text-sm text-rose-300">
                                {(detailQuery.error as any)?.message ?? "공지 내용을 불러오지 못했어요."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-neutral-400">제목</label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                                        placeholder="공지 제목"
                                    />
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-neutral-400">카테고리</label>
                                        <input
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                                            placeholder="일반/이벤트/안내"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
                                            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
                                            <span className="text-sm font-extrabold text-neutral-100">고정</span>
                                        </label>
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
                                            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                                            <span className="text-sm font-extrabold text-neutral-100">노출</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-neutral-400">내용</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={14}
                                        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                                        placeholder="공지 내용을 입력하세요"
                                    />
                                </div>

                                {saveMut.isError ? (
                                    <div className="rounded-xl border border-rose-800/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {(saveMut.error as any)?.message ?? "저장에 실패했어요."}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </main>
    );
}