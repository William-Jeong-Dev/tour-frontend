// src/pages/client/NoticesPage.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";
import { listNotices, type Notice } from "../../api/notices.api";

type Tab = "ALL" | "PINNED" | "NORMAL";

function badgeClass(cat?: string) {
    // DB category가 "공지"/"일반" 외로 올 수도 있으니 안전하게 처리
    if (cat === "공지") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-neutral-200 bg-white text-neutral-700";
}

function safeYmd(iso?: string) {
    if (!iso) return "-";
    // "2026-01-21 09:24:47.73012+00" / ISO 둘 다 안전하게
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
        return d.toISOString().slice(0, 10);
    } catch {
        return String(iso).slice(0, 10);
    }
}

export default function NoticesPage() {
    const [tab, setTab] = useState<Tab>("ALL");
    const [qInput, setQInput] = useState("");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const listQuery = useQuery({
        queryKey: ["notices", { tab, q, page, limit }],
        queryFn: () => listNotices({ tab, q, page, limit }),
        staleTime: 30_000,
        // (v5) keepPreviousData 대신 placeholderData를 쓰는게 정석
        placeholderData: (prev) => prev,
    });

    const rows = (listQuery.data?.rows ?? []) as Notice[];
    const count = listQuery.data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(count / limit));

    const onSearch = () => {
        setQ(qInput);
        setPage(1);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") onSearch();
    };

    const tabs = useMemo(
        () =>
            [
                { key: "ALL" as const, label: "전체" },
                { key: "PINNED" as const, label: "고정" },
                { key: "NORMAL" as const, label: "일반" },
            ] satisfies Array<{ key: Tab; label: string }>,
        []
    );

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        {/* 좌측 메뉴 */}
                        <aside className="col-span-12 md:col-span-3">
                            {/* 공지/FAQ/문의 공통 좌측 네비 */}
                            <ServiceSideNav title="공지사항" />
                        </aside>

                        {/* 우측 내용 */}
                        <section className="col-span-12 md:col-span-9">
                            {/* 검색바 */}
                            <div className="flex items-center gap-2">
                                <input
                                    value={qInput}
                                    onChange={(e) => setQInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="검색어를 입력해주세요"
                                    className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                />

                                {/* ✅ 검색 버튼 찌그러짐 방지: w-12/min-w-12 + shrink-0 */}
                                <button
                                    type="button"
                                    onClick={onSearch}
                                    className="shrink-0 h-11 w-12 min-w-12 grid place-items-center rounded-xl bg-[#1C8B7B] text-white hover:brightness-95"
                                    aria-label="검색"
                                    title="검색"
                                >
                                    🔍
                                </button>
                            </div>

                            {/* 탭 */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {tabs.map((t) => {
                                    const active = tab === t.key;
                                    return (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => {
                                                setTab(t.key);
                                                setPage(1);
                                            }}
                                            className={[
                                                "rounded-full px-4 py-2 text-sm font-extrabold transition",
                                                active
                                                    ? "bg-[#1C8B7B] text-white"
                                                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                                            ].join(" ")}
                                        >
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 리스트 */}
                            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
                                {listQuery.isLoading ? (
                                    <div className="bg-white p-6 text-sm text-neutral-500">불러오는 중...</div>
                                ) : listQuery.isError ? (
                                    <div className="bg-white p-6 text-sm text-rose-700">
                                        {(listQuery.error as any)?.message ?? "공지사항을 불러오지 못했어요."}
                                    </div>
                                ) : rows.length === 0 ? (
                                    <div className="bg-white p-6 text-sm text-neutral-500">공지사항이 없어요.</div>
                                ) : (
                                    <div className="divide-y divide-neutral-200">
                                        {rows.map((n) => (
                                            <Link
                                                key={n.id}
                                                to={`/notices/${n.id}`}
                                                className="flex items-center justify-between gap-4 bg-white px-5 py-4 hover:bg-neutral-50"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                          <span
                              className={`shrink-0 rounded-md border px-2 py-1 text-xs font-extrabold ${badgeClass(
                                  n.category
                              )}`}
                          >
                            {n.category ?? "일반"}
                          </span>

                                                    <span className="shrink-0 text-xs font-bold text-neutral-500">
                            {n.is_pinned ? "고정" : ""}
                          </span>

                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-extrabold text-neutral-900">{n.title}</div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-xs font-semibold text-neutral-500">{safeYmd(n.created_at)}</div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 페이지네이션 */}
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 disabled:opacity-50"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    이전
                                </button>

                                <button className="h-9 w-9 rounded-lg bg-[#1C8B7B] text-xs font-extrabold text-white">
                                    {page}
                                </button>

                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 disabled:opacity-50"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    다음
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
