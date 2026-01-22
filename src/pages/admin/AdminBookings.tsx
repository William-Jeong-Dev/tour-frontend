// src/pages/admin/AdminBookings.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Container from "../../components/common/Container";
import { useSession } from "../../hooks/useSession";
import { supabase } from "../../lib/supabase";

import { isAdmin } from "../../api/admin.api";
import { getAdminBookings, updateBookingAdmin, type BookingStatus } from "../../api/bookings.api";

const BUCKET_NAME = "product-thumbnails";

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

    // 2) 예약 목록
    const listQuery = useQuery({
        queryKey: ["adminBookings", { statusFilter }],
        queryFn: () => getAdminBookings(statusFilter === "ALL" ? undefined : statusFilter),
        enabled: adminOk === true,
    });

    const rows = useMemo(() => (listQuery.data ?? []) as any[], [listQuery.data]);

    // 3) 썸네일 signed url 생성
    useEffect(() => {
        const run = async () => {
            if (!rows.length) return;

            const next: Record<string, string> = {};
            for (const b of rows) {
                const rawPath = String(b.products?.thumbnail_path ?? b.products?.thumbnail_url ?? "").trim();
                if (!rawPath) continue;

                const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(rawPath, 60 * 60);
                if (!error && data?.signedUrl) next[b.id] = data.signedUrl;
            }
            setThumbMap(next);
        };
        run();
    }, [rows]);

    // 4) 상태/메모 업데이트
    const updateMut = useMutation({
        mutationFn: (args: { id: string; patch: { status?: BookingStatus; memo_admin?: string | null } }) =>
            updateBookingAdmin(args.id, args.patch),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["adminBookings"] });
        },
    });

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
                            <p className="mt-2 text-sm text-neutral-400">접수/확정/취소/완료 관리</p>
                        </div>

                        <div className="flex items-center gap-2">
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
                                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2 text-sm font-bold text-neutral-100 hover:bg-neutral-900"
                                onClick={() => listQuery.refetch()}
                            >
                                새로고침
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
                        ) : rows.length === 0 ? (
                            <div className="text-sm text-neutral-400">예약 내역이 없어요.</div>
                        ) : (
                            <div className="space-y-3">
                                {rows.map((b) => {
                                    const p = b.products;
                                    const u = b.profiles;

                                    const title = p?.title ?? "(상품 정보 없음)";
                                    const region = p?.region ?? "";
                                    const thumb = thumbMap[b.id] || "";

                                    const statusText = STATUS_LABEL[b.status] ?? b.status;

                                    return (
                                        <div
                                            key={b.id}
                                            className="flex gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4"
                                        >
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

                                                    {/* ✅ 상태 뱃지(다크용) */}
                                                    <span
                                                        className={[
                                                            "rounded-full border px-2 py-0.5 text-[11px] font-extrabold",
                                                            statusBadgeClass[b.status] ?? "border-neutral-800 bg-neutral-900 text-neutral-200",
                                                        ].join(" ")}
                                                    >
                            {statusText}
                          </span>
                                                </div>

                                                <div className="mt-1 text-xs text-neutral-300">
                                                    {region}
                                                    {b.people_count ? ` · 인원 ${b.people_count}명` : ""}
                                                    {b.travel_date ? ` · 희망일 ${b.travel_date}` : ""}
                                                </div>

                                                {/* ✅ 날짜: safeKST 사용 */}
                                                <div className="mt-1 text-[11px] text-neutral-500">
                                                    접수: {safeKST(b.created_at)}
                                                    {b.updated_at ? ` · 수정: ${safeKST(b.updated_at)}` : ""}
                                                </div>

                                                {/* ✅ 고객 정보: 흰 박스 → 다크 서브카드 */}
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

                                                {/* ✅ 메모 textarea 다크 */}
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

                                            {/* ✅ 버튼 컬럼(다크 통일) */}
                                            <div className="shrink-0 flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-xl bg-[#1C8B7B] px-3 py-2 text-xs font-extrabold text-white hover:brightness-110 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={() =>
                                                        updateMut.mutate({
                                                            id: String(b.id),
                                                            patch: { status: "CONFIRMED" },
                                                        })
                                                    }
                                                >
                                                    확정
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={() =>
                                                        updateMut.mutate({
                                                            id: String(b.id),
                                                            patch: { status: "COMPLETED" },
                                                        })
                                                    }
                                                >
                                                    완료
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-rose-800/60 bg-rose-500/10 px-3 py-2 text-xs font-extrabold text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={() => {
                                                        const ok = confirm("취소 처리할까요?");
                                                        if (!ok) return;
                                                        updateMut.mutate({
                                                            id: String(b.id),
                                                            patch: { status: "CANCELLED" },
                                                        });
                                                    }}
                                                >
                                                    취소
                                                </button>

                                                <button
                                                    type="button"
                                                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs font-bold text-neutral-100 hover:bg-neutral-900 disabled:opacity-60"
                                                    disabled={updateMut.isPending}
                                                    onClick={() =>
                                                        updateMut.mutate({
                                                            id: String(b.id),
                                                            patch: { memo_admin: memoDraft[b.id] ?? b.memo_admin ?? "" },
                                                        })
                                                    }
                                                >
                                                    메모 저장
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </main>
    );
}