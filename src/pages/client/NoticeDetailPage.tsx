// src/pages/client/NoticeDetailPage.tsx
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";
import { getNotice } from "../../api/notices.api";

function safeYmd(iso?: string) {
    if (!iso) return "-";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
        return d.toISOString().slice(0, 10);
    } catch {
        return String(iso).slice(0, 10);
    }
}

export default function NoticeDetailPage() {
    const { id } = useParams();
    const noticeId = String(id ?? "");

    const detailQuery = useQuery({
        queryKey: ["notice", noticeId],
        queryFn: () => getNotice(noticeId),
        enabled: Boolean(noticeId),
        staleTime: 30_000,
    });

    const n = detailQuery.data;

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        {/* 소개/좌측 메뉴 */}
                        <aside className="col-span-12 md:col-span-3">
                            <ServiceSideNav title="공지사항" />
                        </aside>

                        {/* 본문 */}
                        <section className="col-span-12 md:col-span-9">
                            {detailQuery.isLoading ? (
                                <div className="text-sm text-neutral-500">불러오는 중...</div>
                            ) : detailQuery.isError ? (
                                <div className="text-sm text-rose-700">
                                    {(detailQuery.error as any)?.message ?? "공지 상세를 불러오지 못했어요."}
                                </div>
                            ) : !n ? (
                                <div className="text-sm text-neutral-500">공지 정보가 없어요.</div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-neutral-500">공지사항</div>
                                            <h1 className="mt-2 break-words text-2xl font-extrabold text-neutral-900">{n.title}</h1>
                                            <div className="mt-2 text-xs text-neutral-500">{safeYmd(n.created_at)}</div>
                                        </div>

                                        <Link
                                            to="/notices"
                                            className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                        >
                                            목록으로
                                        </Link>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                    <pre className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                      {n.content ?? ""}
                    </pre>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
