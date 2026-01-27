import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers, useAdminUsersSummary } from "../../hooks/useAdminUsers";

function fmt(dt?: string | null) {
    if (!dt) return "-";
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminUsers() {
    const nav = useNavigate();
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);

    const summary = useAdminUsersSummary();
    const usersQ = useAdminUsers(q, page, 50);

    const rows = useMemo(() => usersQ.data ?? [], [usersQ.data]);

    return (
        <div className="space-y-4">
            <div>
                <div className="text-lg font-extrabold">회원 현황</div>
                <div className="text-sm text-neutral-400">가입 회원 목록 및 활동(예약/찜) 현황</div>
            </div>

            {/* 요약 */}
            <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                    title="총 회원"
                    value={summary.isLoading ? "..." : String((summary.data as any)?.total_users ?? "-")}
                />
                <StatCard
                    title="오늘 가입"
                    value={summary.isLoading ? "..." : String((summary.data as any)?.today_new_users ?? "-")}
                />
                <StatCard
                    title="마케팅 동의"
                    value={summary.isLoading ? "..." : String((summary.data as any)?.marketing_opt_in_users ?? "-")}
                />
            </div>

            {/* 검색 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-extrabold text-neutral-200">검색</div>
                    <div className="flex gap-2">
                        <input
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setPage(1);
                            }}
                            placeholder="이메일/이름/전화"
                            className="w-[260px] rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 리스트 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-neutral-200">회원 목록</div>
                    <div className="text-xs text-neutral-400">페이지 {page}</div>
                </div>

                {usersQ.isLoading ? (
                    <div className="mt-4 text-sm text-neutral-400">불러오는 중...</div>
                ) : usersQ.isError ? (
                    <div className="mt-4 text-sm text-red-400">
                        에러: {(usersQ.error as any)?.message ?? "unknown error"}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="mt-4 text-sm text-neutral-400">결과가 없습니다.</div>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-[860px] w-full text-left text-sm">
                            <thead className="text-xs text-neutral-400">
                            <tr className="border-b border-neutral-900">
                                <th className="py-2 pr-3">이메일</th>
                                <th className="py-2 pr-3">이름</th>
                                <th className="py-2 pr-3">전화</th>
                                <th className="py-2 pr-3">가입일</th>
                                <th className="py-2 pr-3">예약</th>
                                <th className="py-2 pr-3">찜</th>
                                <th className="py-2 pr-3">최근예약</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((u) => (
                                <tr
                                    key={u.user_id}
                                    className="border-b border-neutral-900/70 hover:bg-neutral-950/40 cursor-pointer"
                                    onClick={() => nav(`/admin/users/${u.user_id}`)}
                                >
                                    <td className="py-3 pr-3 text-neutral-100">{u.email ?? "-"}</td>
                                    <td className="py-3 pr-3 text-neutral-200">{u.name ?? "-"}</td>
                                    <td className="py-3 pr-3 text-neutral-200">{u.phone ?? "-"}</td>
                                    <td className="py-3 pr-3 text-neutral-300">{fmt(u.created_at)}</td>
                                    <td className="py-3 pr-3 text-neutral-200">{u.booking_count}</td>
                                    <td className="py-3 pr-3 text-neutral-200">{u.favorite_count}</td>
                                    <td className="py-3 pr-3 text-neutral-300">{fmt(u.last_booking_at)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-extrabold text-neutral-200 disabled:opacity-50"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        이전
                    </button>
                    <button
                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-extrabold text-neutral-200 disabled:opacity-50"
                        disabled={(usersQ.data?.length ?? 0) < 50}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
            <div className="text-xs font-semibold text-neutral-400">{title}</div>
            <div className="mt-2 text-2xl font-extrabold text-neutral-100">{value}</div>
        </div>
    );
}