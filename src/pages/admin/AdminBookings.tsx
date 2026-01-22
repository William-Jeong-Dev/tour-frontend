// src/pages/admin/AdminBookings.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Container from "../../components/common/Container";
import { useSession } from "../../hooks/useSession";
import { supabase } from "../../lib/supabase";

import { isAdmin } from "../../api/admin.api";
import { getAdminBookings, updateBookingAdmin, type BookingStatus } from "../../api/bookings.api";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

const BUCKET_NAME = "product-thumbnails";
const PAGE_SIZE = 50;

const STATUS_LABEL: Record<string, string> = {
    REQUESTED: "접수",
    CONFIRMED: "확정",
    CANCELLED: "취소",
    COMPLETED: "완료",
};

const statusBadgeClass: Record<string, string> = {
    REQUESTED: "border-amber-800/60 bg-amber-500/10 text-amber-300",
    CONFIRMED: "border-emerald-800/60 bg-emerald-500/10 text-emerald-300",
    CANCELLED: "border-rose-800/60 bg-rose-500/10 text-rose-300",
    COMPLETED: "border-sky-800/60 bg-sky-500/10 text-sky-300",
};

function safeKST(iso: string | null | undefined) {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString("ko-KR");
    } catch {
        return String(iso);
    }
}

export default function AdminBookings() {
    const nav = useNavigate();
    const qc = useQueryClient();
    const { session, loading: sessionLoading } = useSession();
    const userId = session?.user?.id ?? null;

    const [adminOk, setAdminOk] = useState<boolean | null>(null);
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("REQUESTED");

    // ✅ 검색/정렬/피드백/즉시 숨김
    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState<"created_desc" | "updated_desc">("created_desc");
    const [flash, setFlash] = useState<Record<string, "saved" | "updated">>({});
    const [localHidden, setLocalHidden] = useState<Record<string, boolean>>({});

    // ✅ 페이지네이션
    const [page, setPage] = useState(1); // 1부터
    const limit = PAGE_SIZE;
    const offset = (page - 1) * PAGE_SIZE;

    // booking id -> signedUrl
    const [thumbMap, setThumbMap] = useState<Record<string, string>>({});
    // booking id -> memo_admin draft
    const [memoDraft, setMemoDraft] = useState<Record<string, string>>({});

    // 1) 어드민 가드
    useEffect(() => {
        const run = async () => {
            if (sessionLoading) return;
            if (!session || !userId) {
                nav("/login", { replace: true });
                return;
            }
            const ok = await isAdmin(userId);
            setAdminOk(ok);
            if (!ok) nav("/", { replace: true });
        };
        run();
    }, [sessionLoading, session, userId, nav]);

    // ✅ 필터/정렬이 바뀌면 첫 페이지로
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    // 2) 예약 목록 (서버 페이지네이션)
    const listQuery = useQuery({
        queryKey: ["adminBookings", { statusFilter, limit, offset }],
        queryFn: () =>
            getAdminBookings(statusFilter === "ALL" ? undefined : statusFilter, { limit, offset }),
        enabled: adminOk === true,
        placeholderData: keepPreviousData,
    });

    const totalCount = listQuery.data?.count ?? 0;
    const rows = useMemo(() => (listQuery.data?.rows ?? []) as any[], [listQuery.data]);
    const hasMore = offset + rows.length < totalCount;

    // ✅ 페이지/필터 바뀌거나 데이터가 새로 오면 localHidden 초기화
    useEffect(() => {
        setLocalHidden({});
    }, [statusFilter, page, listQuery.data]);

    // ✅ 화면에 보여줄 rows: (localHidden 반영) + 검색 + 정렬
    const visibleRows = useMemo(() => {
        const base = rows.filter((b: any) => !localHidden[String(b.id)]);

        // 1) 검색
        const keyword = q.trim().toLowerCase();
        const filtered = !keyword
            ? base
            : base.filter((b: any) => {
                const p = b.products ?? {};
                const u = b.profiles ?? {};

                const hay = [
                    b.id,
                    b.status,
                    p.title,
                    p.region,
                    u.email,
                    u.name,
                    u.phone,
                    b.memo_user,
                    b.memo_admin,
                    b.travel_date,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return hay.includes(keyword);
            });

        // 2) 정렬(프론트)
        filtered.sort((a: any, b: any) => {
            const ka = sortKey === "updated_desc" ? a.updated_at : a.created_at;
            const kb = sortKey === "updated_desc" ? b.updated_at : b.created_at;
            return String(kb ?? "").localeCompare(String(ka ?? ""));
        });

        return filtered;
    }, [rows, q, sortKey, localHidden]);

    // 3) 썸네일 signed url 생성 (현재 페이지/검색 결과 기준)
    useEffect(() => {
        const run = async () => {
            if (!visibleRows.length) return;

            const next: Record<string, string> = {};
            const targets = visibleRows.filter((b) => !thumbMap[b.id]);

            if (!targets.length) return;

            for (const b of targets) {
                const rawPath = String(b.products?.thumbnail_path ?? b.products?.thumbnail_url ?? "").trim();
                if (!rawPath) continue;

                const { data, error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .createSignedUrl(rawPath, 60 * 60);

                if (!error && data?.signedUrl) next[b.id] = data.signedUrl;
            }

            if (Object.keys(next).length) {
                setThumbMap((m) => ({ ...m, ...next }));
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleRows]);

    // 4) 상태/메모 업데이트
    const updateMut = useMutation({
        mutationFn: (args: { id: string; patch: { status?: BookingStatus; memo_admin?: string | null } }) =>
            updateBookingAdmin(args.id, args.patch),
        onSuccess: async (_data, vars) => {
            setFlash((m) => ({ ...m, [vars.id]: vars.patch.memo_admin != null ? "saved" : "updated" }));
            setTimeout(() => {
                setFlash((m) => {
                    const next = { ...m };
                    delete next[vars.id];
                    return next;
                });
            }, 1200);

            // ✅ 현재 페이지 다시 가져오기
            await qc.invalidateQueries({ queryKey: ["adminBookings"] });
        },
    });

    // ✅ optimistic hide + 실패 시 rollback
    const runUpdateWithOptimisticHide = async (
        bookingId: string,
        patch: { status?: BookingStatus; memo_admin?: string | null }
    ) => {
        const isStatusChange = typeof patch.status !== "undefined";

        try {
            // 상태 변경 + ALL 아니면 즉시 숨김(현재 페이지에서 빠지는 느낌)
            if (isStatusChange && statusFilter !== "ALL") {
                setLocalHidden((m) => ({ ...m, [bookingId]: true }));
            }
            await updateMut.mutateAsync({ id: bookingId, patch });
        } catch (e) {
            if (isStatusChange && statusFilter !== "ALL") {
                setLocalHidden((m) => {
                    const next = { ...m };
                    delete next[bookingId];
                    return next;
                });
            }
            throw e;
        }
    };

    if (sessionLoading || adminOk === null) return null;
    if (adminOk === false) return null;

    return (
        <main className="bg-transparent">
            <Container>
                <div className="py-10 text-neutral-100">
                    {/* 헤더 */}
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold text-neutral-100">예약 현황 (어드민)</h1>
                            <p className="mt-2 text-sm text-neutral-400">
                                총 {totalCount.toLocaleString("ko-KR")}건 · 페이지 {page}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {/* 검색 */}
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="검색: 상품명/이메일/전화/요청메모"
                                className="w-[260px] max-w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                            />

                            {/* 정렬 */}
                            <select
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-100 outline-none focus:border-neutral-600"
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as any)}
                            >
                                <option value="created_desc">최근 접수순</option>
                                <option value="updated_desc">최근 수정순</option>
                            </select>

                            {/* 상태 필터 */}
                            <select
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-bold text-neutral-100 outline-none focus:border-neutral-600"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="ALL">전체</option>
                                <option value="REQUESTED">접수</option>
                                <option value="CONFIRMED">확정</option>
                                <option value="CANCELLED">취소</option>
                                <option value="COMPLETED">완료</option>
                            </select>

                            <button
                                type="button"
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                disabled={listQuery.isFetching}
                                onClick={() => listQuery.refetch()}
                            >
                                {listQuery.isFetching ? "갱신 중..." : "새로고침"}
                            </button>
                        </div>
                    </div>

                    {/* 리스트 컨테이너 */}
                    <div className="mt-6 rounded-2xl border border-neutral-900 bg-neutral-950/30 p-6">
                        {listQuery.isLoading ? (
                            <div className="text-sm text-neutral-400">불러오는 중...</div>
                        ) : listQuery.isError ? (
                            <div className="text-sm text-rose-300">
                                {(listQuery.error as any)?.message ?? "예약 목록을 불러오지 못했어요."}
                            </div>
                        ) : visibleRows.length === 0 ? (
                            <div className="text-sm text-neutral-400">예약 내역이 없어요.</div>
                        ) : (
                            <div className="space-y-3">
                                {visibleRows.map((b) => {
                                    const p = b.products;
                                    const u = b.profiles;

                                    const title = p?.title ?? "(상품 정보 없음)";
                                    const region = p?.region ?? "";
                                    const thumb = thumbMap[b.id] || "";
                                    const statusText = STATUS_LABEL[b.status] ?? b.status;

                                    return (
                                        <div key={b.id} className="flex gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                                            {/* 썸네일 */}
                                            <div className="h-16 w-24 overflow-hidden rounded-xl bg-neutral-900">
                                                {thumb ? (
                                                    <img src={thumb} alt={title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full grid place-items-center text-[11px] font-bold text-neutral-500">
                                                        NO IMAGE
                                                    </div>
                                                )}
                                            </div>

                                            {/* 본문 */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="text-sm font-extrabold text-neutral-100 line-clamp-1">{title}</div>

                                                    <span
                                                        className={[
                                                            "rounded-full border px-2 py-0.5 text-[11px] font-extrabold",
                                                            statusBadgeClass[b.status] ?? "border-neutral-800 bg-neutral-900 text-neutral-200",
                                                        ].join(" ")}
                                                    >
                            {statusText}
                          </span>

                                                    {flash[b.id] ? (
                                                        <span className="rounded-full border border-emerald-800/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-300">
                              {flash[b.id] === "saved" ? "메모 저장됨" : "업데이트됨"}
                            </span>
                                                    ) : null}
                                                </div>

                                                <div className="mt-1 text-xs text-neutral-300">
                                                    {region}
                                                    {b.people_count ? ` · 인원 ${b.people_count}명` : ""}
                                                    {b.travel_date ? ` · 희망일 ${b.travel_date}` : ""}
                                                </div>

                                                <div className="mt-1 text-[11px] text-neutral-500">
                                                    접수: {safeKST(b.created_at)}
                                                    {b.updated_at ? ` · 수정: ${safeKST(b.updated_at)}` : ""}
                                                </div>

                                                <div className="mt-2 rounded-xl border border-neutral-900 bg-neutral-950/50 p-3">
                                                    <div className="text-[11px] font-bold text-neutral-400">고객 정보</div>
                                                    <div className="mt-1 text-xs text-neutral-200">
                                                        {u?.name ?? "-"} / {u?.phone ?? "-"} / {u?.email ?? "-"}
                                                    </div>

                                                    {b.memo_user ? (
                                                        <div className="mt-2 text-xs text-neutral-300">
                                                            <span className="font-bold text-neutral-200">요청:</span> {b.memo_user}
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="mt-3">
                                                    <label className="text-[11px] font-bold text-neutral-400">어드민 메모</label>
                                                    <textarea
                                                        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                                                        rows={2}
                                                        value={memoDraft[b.id] ?? b.memo_admin ?? ""}
                                                        onChange={(e) => setMemoDraft((m) => ({ ...m, [b.id]: e.target.value }))}
                                                        placeholder="예: 고객 연락 완료 / 일정 조율 중..."
                                                    />
                                                </div>
                                            </div>

                                            {/* 버튼 */}
                                            <div className="shrink-0 flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-xl bg-[#1C8B7B] px-3 py-2 text-xs font-extrabold text-white hover:brightness-110 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={async () => {
                                                        try {
                                                            await runUpdateWithOptimisticHide(String(b.id), { status: "CONFIRMED" });
                                                        } catch (err: any) {
                                                            alert(err?.message ?? "확정 처리에 실패했습니다.");
                                                        }
                                                    }}
                                                >
                                                    확정
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={async () => {
                                                        try {
                                                            await runUpdateWithOptimisticHide(String(b.id), { status: "COMPLETED" });
                                                        } catch (err: any) {
                                                            alert(err?.message ?? "완료 처리에 실패했습니다.");
                                                        }
                                                    }}
                                                >
                                                    완료
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-rose-800/60 bg-rose-500/10 px-3 py-2 text-xs font-extrabold text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={async () => {
                                                        const ok = confirm("취소 처리할까요?");
                                                        if (!ok) return;
                                                        try {
                                                            await runUpdateWithOptimisticHide(String(b.id), { status: "CANCELLED" });
                                                        } catch (err: any) {
                                                            alert(err?.message ?? "취소 처리에 실패했습니다.");
                                                        }
                                                    }}
                                                >
                                                    취소
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={async () => {
                                                        try {
                                                            await runUpdateWithOptimisticHide(String(b.id), {
                                                                memo_admin: memoDraft[b.id] ?? b.memo_admin ?? "",
                                                            });
                                                        } catch (err: any) {
                                                            alert(err?.message ?? "메모 저장에 실패했습니다.");
                                                        }
                                                    }}
                                                >
                                                    메모 저장
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ✅ 페이지네이션 버튼 */}
                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                disabled={page <= 1 || listQuery.isFetching}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← 이전
                            </button>

                            <div className="text-xs text-neutral-400">
                                {totalCount ? (
                                    <>
                                        {offset + 1}–{Math.min(offset + rows.length, totalCount)} / {totalCount.toLocaleString("ko-KR")}
                                    </>
                                ) : (
                                    "-"
                                )}
                            </div>

                            <button
                                type="button"
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                disabled={!hasMore || listQuery.isFetching}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                다음 →
                            </button>
                        </div>

                        {/* ✅ 더보기 버튼(선택사항: “다음” 대신 사용하고 싶으면) */}
                        {/*
            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm font-extrabold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                disabled={!hasMore || listQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {hasMore ? (listQuery.isFetching ? "불러오는 중..." : "더보기") : "마지막입니다"}
              </button>
            </div>
            */}
                    </div>
                </div>
            </Container>
        </main>
    );
}
