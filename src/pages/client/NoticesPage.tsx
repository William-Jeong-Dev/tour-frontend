import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";

type Notice = {
    id: string;
    category: "공지" | "일반";
    title: string;
    created_at: string; // YYYY-MM-DD
    is_pinned?: boolean;
};

const DEMO: Notice[] = [
    { id: "1", category: "일반", title: "5월 신용카드 무이자 할부 안내", created_at: "2024-12-04", is_pinned: true },
    { id: "2", category: "일반", title: "지안투어 골프투어 서비스 지역 안내", created_at: "2024-10-31", is_pinned: true },
    { id: "3", category: "일반", title: "지안투어 가을 예약 이벤트 🍁", created_at: "2024-10-24", is_pinned: true },
    { id: "4", category: "일반", title: "지안투어 비즈니스 골프투어 1:1 컨시어지 서비스", created_at: "2024-10-24", is_pinned: true },
    { id: "5", category: "일반", title: "Q. 골프여행 예약 과정은 어떻게 되나요?", created_at: "2024-10-24", is_pinned: true },
    { id: "6", category: "공지", title: "연말 휴무 안내", created_at: "2024-12-20" },
    { id: "7", category: "공지", title: "예약 시스템 오픈 안내", created_at: "2025-01-10" },
];

function badgeClass(cat: Notice["category"]) {
    if (cat === "공지") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-neutral-200 bg-white text-neutral-700";
}

export default function NoticesPage() {
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const rows = useMemo(() => {
        const keyword = q.trim().toLowerCase();
        const list = [...DEMO].sort((a, b) => {
            const pa = a.is_pinned ? 1 : 0;
            const pb = b.is_pinned ? 1 : 0;
            if (pa !== pb) return pb - pa;
            return String(b.created_at).localeCompare(String(a.created_at));
        });

        if (!keyword) return list;
        return list.filter((x) => x.title.toLowerCase().includes(keyword));
    }, [q]);

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const pageRows = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return rows.slice(start, start + pageSize);
    }, [rows, safePage]);

    const onSearch = () => setPage(1);

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        {/* ✅ 좌측 메뉴 통일 */}
                        <ServiceSideNav title="공지사항" />

                        {/* 우측 내용 */}
                        <section className="col-span-12 md:col-span-9">
                            {/* 검색바 */}
                            <div className="flex items-center gap-2">
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="검색어를 입력해주세요"
                                    className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                />

                                {/* ✅ 찌그러짐 방지: shrink-0 + 고정 w/h */}
                                <button
                                    type="button"
                                    onClick={onSearch}
                                    className="shrink-0 h-11 w-11 grid place-items-center rounded-xl bg-[#1C8B7B] text-white hover:brightness-95"
                                    aria-label="검색"
                                    title="검색"
                                >
                                    🔍
                                </button>
                            </div>

                            {/* 리스트 */}
                            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
                                <div className="divide-y divide-neutral-200">
                                    {pageRows.map((n) => (
                                        <Link
                                            key={n.id}
                                            to={`/notices/${n.id}`}
                                            className="flex items-center justify-between gap-4 bg-white px-5 py-4 hover:bg-neutral-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                        <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-extrabold ${badgeClass(n.category)}`}>
                          {n.category}
                        </span>

                                                <span className="shrink-0 text-xs font-bold text-neutral-500">
                          {n.is_pinned ? "고정" : ""}
                        </span>

                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-extrabold text-neutral-900">{n.title}</div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-xs font-semibold text-neutral-500">{n.created_at}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* 페이지네이션 */}
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 disabled:opacity-50"
                                    disabled={safePage <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => {
                                    const num = i + 1;
                                    const active = num === safePage;
                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setPage(num)}
                                            className={[
                                                "h-9 w-9 rounded-lg text-xs font-extrabold",
                                                active ? "bg-[#1C8B7B] text-white" : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                                            ].join(" ")}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 disabled:opacity-50"
                                    disabled={safePage >= totalPages}
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
