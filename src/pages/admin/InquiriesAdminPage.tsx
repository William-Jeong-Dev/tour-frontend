import { useState } from "react";
import Container from "../../components/common/Container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListInquiries, adminUpdateInquiry, type InquiryRow, type InquiryStatus } from "../../api/inquiries.api";

function Badge({ status }: { status: InquiryStatus }) {
    const label = status === "NEW" ? "신규" : status === "IN_PROGRESS" ? "처리중" : "완료";
    const cls =
        status === "NEW"
            ? "bg-yellow-100 text-yellow-800"
            : status === "IN_PROGRESS"
                ? "bg-sky-100 text-sky-800"
                : "bg-emerald-100 text-emerald-800";
    return <span className={`rounded-full px-2 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}

function fmtDate(ts: string) {
    try {
        return new Date(ts).toLocaleString();
    } catch {
        return ts;
    }
}

export default function InquiriesAdminPage() {
    const qc = useQueryClient();

    const q = useQuery({
        queryKey: ["admin", "inquiries"],
        queryFn: () => adminListInquiries(300),
        staleTime: 10_000,
    });

    const list = q.data ?? [];

    const [selected, setSelected] = useState<InquiryRow | null>(null);
    const [memo, setMemo] = useState("");
    const [saving, setSaving] = useState(false);

    const open = (row: InquiryRow) => {
        setSelected(row);
        setMemo(row.memo_admin ?? "");
    };

    const save = async (status: InquiryStatus) => {
        if (!selected) return;
        setSaving(true);
        try {
            await adminUpdateInquiry(selected.id, { status, memo_admin: memo });
            await qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
            // 최신값 다시 반영(선택된 항목도 업데이트)
            const refreshed = await adminListInquiries(300);
            const again = refreshed.find((r) => r.id === selected.id) ?? null;
            if (again) {
                setSelected(again);
                setMemo(again.memo_admin ?? memo);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100">
            <Container>
                <div className="py-8 md:py-10">
                    <h1 className="text-2xl font-extrabold">문의 현황</h1>

                    {q.isLoading ? (
                        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-300">
                            불러오는 중...
                        </div>
                    ) : q.error ? (
                        <div className="mt-6 rounded-2xl border border-red-900/40 bg-red-950/30 p-6 text-sm text-red-200">
                            조회 실패: {(q.error as any)?.message ?? String(q.error)}
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_460px]">
                            {/* 리스트 */}
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                                <div className="px-5 py-4 border-b border-neutral-800 text-sm font-bold text-neutral-200">
                                    총 {list.length}건
                                </div>

                                <div className="divide-y divide-neutral-800">
                                    {list.map((row) => (
                                        <button
                                            key={row.id}
                                            type="button"
                                            onClick={() => open(row)}
                                            className="w-full text-left px-5 py-4 hover:bg-neutral-900/60"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="font-extrabold text-white line-clamp-1">{row.title}</div>
                                                <Badge status={row.status} />
                                            </div>

                                            <div className="mt-1 text-xs text-neutral-400 line-clamp-1">{row.content}</div>

                                            {/* ✅ 고객 정보 표시 */}
                                            <div className="mt-2 text-xs text-neutral-500">
                                                {fmtDate(row.created_at)} · {row.contact_name} · {row.contact_phone}
                                                {row.contact_email ? ` · ${row.contact_email}` : ""}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 상세 */}
                            <aside className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
                                {!selected ? (
                                    <div className="text-sm text-neutral-300">왼쪽에서 문의를 선택하세요.</div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-lg font-extrabold text-white">{selected.title}</div>
                                                <div className="mt-1 text-xs text-neutral-500">{fmtDate(selected.created_at)}</div>
                                            </div>
                                            <Badge status={selected.status} />
                                        </div>

                                        {/* ✅ 고객 정보 박스 */}
                                        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                                            <div className="text-xs font-bold text-neutral-200">고객 정보</div>
                                            <div className="mt-2 space-y-1 text-sm text-neutral-200">
                                                <div>
                                                    <span className="text-neutral-400">이름:</span> {selected.contact_name}
                                                </div>
                                                <div>
                                                    <span className="text-neutral-400">전화:</span>{" "}
                                                    <a className="underline decoration-neutral-600 hover:decoration-neutral-400" href={`tel:${selected.contact_phone}`}>
                                                        {selected.contact_phone}
                                                    </a>
                                                </div>
                                                {selected.contact_email ? (
                                                    <div>
                                                        <span className="text-neutral-400">이메일:</span>{" "}
                                                        <a className="underline decoration-neutral-600 hover:decoration-neutral-400" href={`mailto:${selected.contact_email}`}>
                                                            {selected.contact_email}
                                                        </a>
                                                    </div>
                                                ) : null}
                                                <div>
                                                    <span className="text-neutral-400">회원 여부:</span>{" "}
                                                    {selected.user_id ? "회원" : "비회원"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-200 whitespace-pre-wrap">
                                            {selected.content}
                                        </div>

                                        <div className="mt-4 text-sm font-bold text-neutral-200">관리자 메모</div>
                                        <textarea
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                            className="mt-2 w-full min-h-[140px] rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-white/10"
                                            placeholder="처리 내용, 특이사항 등을 기록하세요."
                                        />

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => save("IN_PROGRESS")}
                                                disabled={saving}
                                                className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm font-extrabold text-white hover:bg-neutral-900 disabled:opacity-60"
                                            >
                                                처리중
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => save("DONE")}
                                                disabled={saving}
                                                className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-neutral-950 hover:bg-neutral-100 disabled:opacity-70"
                                            >
                                                완료
                                            </button>
                                        </div>
                                    </>
                                )}
                            </aside>
                        </div>
                    )}
                </div>
            </Container>
        </main>
    );
}
