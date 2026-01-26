import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "../../components/common/Container";
import { useSession } from "../../hooks/useSession";
import { isAdmin } from "../../api/admin.api";
import { adminListNotices } from "../../api/notices.api";

function safeKST(iso: string) {
    try {
        return new Date(iso).toLocaleString("ko-KR");
    } catch {
        return iso;
    }
}

export default function AdminNotices() {
    const nav = useNavigate();
    const { session, loading } = useSession();
    const userId = session?.user?.id ?? null;

    const [q, setQ] = useState("");
    const [published, setPublished] = useState<"ALL" | "Y" | "N">("ALL");
    const [page, setPage] = useState(1);
    const limit = 20;

    // guard (간단 버전)
    useQuery({
        queryKey: ["adminGuard", userId],
        queryFn: async () => {
            if (!userId) throw new Error("NO_SESSION");
            const ok = await isAdmin(userId);
            if (!ok) nav("/", { replace: true });
            return ok;
        },
        enabled: !loading && !!userId,
    });

    const listQuery = useQuery({
        queryKey: ["adminNotices", { q, published, page, limit }],
        queryFn: () => adminListNotices({ q, published, page, limit }),
        enabled: !loading && !!userId,
    });

    const rows = listQuery.data?.rows ?? [];
    const count = listQuery.data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(count / limit));

    const pages = useMemo(() => {
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + 4);
        const out: number[] = [];
        for (let i = start; i <= end; i++) out.push(i);
        return out;
    }, [page, totalPages]);

    if (loading) return null;
    if (!session) return null;

    return (
        <main className="bg-transparent">
            <Container>
                <div className="py-10 text-neutral-100">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold">공지사항 (어드민)</h1>
                            <p className="mt-2 text-sm text-neutral-400">작성/노출/고정 관리</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="검색: 제목"
                                className="w-[260px] max-w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                            />
                            <select
                                value={published}
                                onChange={(e) => {
                                    setPublished(e.target.value as any);
                                    setPage(1);
                                }}
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-100 outline-none focus:border-neutral-600"
                            >
                                <option value="ALL">전체</option>
                                <option value="Y">노출</option>
                                <option value="N">비노출</option>
                            </select>

                            <Link
                                to="/admin/notices/new"
                                className="rounded-xl bg-[#2E97F2] px-4 py-2 text-sm font-extrabold text-white hover:brightness-110"
                            >
                                + 새 공지 작성
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-6">
                        {listQuery.isLoading ? (
                            <div className="text-sm text-neutral-400">불러오는 중...</div>
                        ) : listQuery.isError ? (
                            <div className="text-sm text-rose-300">
                                {(listQuery.error as any)?.message ?? "공지 목록을 불러오지 못했어요."}
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="text-sm text-neutral-400">공지사항이 없어요.</div>
                        ) : (
                            <div className="space-y-3">
                                {rows.map((n) => (
                                    <Link
                                        key={n.id}
                                        to={`/admin/notices/${n.id}`}
                                        className="block rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4 hover:bg-neutral-900/40"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {n.is_pinned ? (
                                                        <span className="rounded-full border border-amber-800/60 bg-amber-500/10 px-2 py-0.5 text-[11px] font-extrabold text-amber-300">
                              고정
                            </span>
                                                    ) : null}
                                                    <span className="text-sm font-extrabold text-neutral-100 line-clamp-1">{n.title}</span>
                                                    <span className="text-[11px] font-bold text-neutral-400">({n.category ?? "일반"})</span>
                                                </div>
                                                <div className="mt-1 text-[11px] text-neutral-500">
                                                    생성: {safeKST(n.created_at)} · 수정: {safeKST(n.updated_at)}
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-2">
                        <span
                            className={[
                                "rounded-full border px-2 py-0.5 text-[11px] font-extrabold",
                                n.is_published
                                    ? "border-emerald-800/60 bg-emerald-500/10 text-emerald-300"
                                    : "border-neutral-800 bg-neutral-900 text-neutral-300",
                            ].join(" ")}
                        >
                          {n.is_published ? "노출" : "비노출"}
                        </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* pagination */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-200 disabled:opacity-40"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                이전
                            </button>

                            {pages.map((p) => (
                                <button
                                    key={p}
                                    className={[
                                        "h-10 w-10 rounded-lg text-sm font-extrabold border",
                                        p === page
                                            ? "bg-neutral-50 text-neutral-950 border-neutral-50"
                                            : "bg-neutral-950/60 text-neutral-200 border-neutral-800 hover:bg-neutral-900",
                                    ].join(" ")}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-200 disabled:opacity-40"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}