import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, listProducts } from "../../api/products.api";
import { getProductRegions, saveProductRegions } from "../../api/siteSettings.api";

function fmtUpdatedAt(iso: string) {
    try {
        const d = new Date(iso);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch {
        return iso;
    }
}

export default function AdminProductList() {
    const qc = useQueryClient();
    const [q, setQ] = useState("");
    const [region, setRegion] = useState("전체");
    const [status, setStatus] = useState<"전체" | "PUBLISHED" | "DRAFT" | "HIDDEN">("전체");
    const [showRegionMgr, setShowRegionMgr] = useState(false);
    const [newRegion, setNewRegion] = useState("");

    const query = useQuery({
        queryKey: ["admin-products", { q, region, status }],
        queryFn: () =>
            listProducts({
                q,
                region,
                status: status === "전체" ? undefined : status,
            }),
    });

    const regionsQuery = useQuery({
        queryKey: ["product-regions"],
        queryFn: getProductRegions,
        staleTime: 60_000,
    });

    const regionList = regionsQuery.data ?? [];
    const regions = useMemo(() => ["전체", ...regionList], [regionList]);

    const saveMutation = useMutation({
        mutationFn: saveProductRegions,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["product-regions"] }),
    });

    const onAddRegion = async () => {
        const trimmed = newRegion.trim();
        if (!trimmed || regionList.includes(trimmed)) return;
        await saveMutation.mutateAsync([...regionList, trimmed]);
        setNewRegion("");
    };

    const onDeleteRegion = async (name: string) => {
        if (!confirm(`"${name}" 지역을 삭제할까요?`)) return;
        await saveMutation.mutateAsync(regionList.filter((r) => r !== name));
        if (region === name) setRegion("전체");
    };

    const items = query.data ?? [];

    const statusOptions = useMemo(
        () => [
            { value: "전체", label: "전체" },
            { value: "PUBLISHED", label: "노출" },
            { value: "DRAFT", label: "임시" },
            { value: "HIDDEN", label: "숨김" },
        ] as const,
        []
    );

    const onDelete = async (id: string) => {
        if (!confirm("정말 삭제할까요?")) return;
        await deleteProduct(id);
        query.refetch();
    };

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-extrabold text-neutral-100">상품 관리</div>
                    <div className="mt-2 text-sm text-neutral-400">기본 정렬: 최근 수정순</div>
                </div>

                <Link
                    to="/admin/products/new/basic"
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-extrabold text-neutral-950"
                >
                    + 새 상품 등록
                </Link>
            </div>

            {/* Filters */}
            <div className="mt-6 grid gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/20 p-4 md:grid-cols-[1fr_180px_180px]">
            <div>
                    <div className="mb-2 text-sm text-neutral-300">검색</div>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="상품명/부제 검색"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                    />
                </div>
                <div>
                    <div className="mb-2 text-sm text-neutral-300">상태</div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-neutral-300">지역</span>
                        <button
                            type="button"
                            onClick={() => setShowRegionMgr((v) => !v)}
                            className="text-xs text-neutral-500 underline hover:text-neutral-200"
                        >
                            {showRegionMgr ? "닫기" : "지역 관리"}
                        </button>
                    </div>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm outline-none"
                    >
                        {regions.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showRegionMgr && (
                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <div className="mb-3 text-sm font-bold text-neutral-200">지역(레거시) 관리</div>
                    {regionsQuery.isLoading ? (
                        <div className="text-xs text-neutral-400">불러오는 중...</div>
                    ) : (
                        <>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {regionList.map((r) => (
                                    <span
                                        key={r}
                                        className="flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200"
                                    >
                                        {r}
                                        <button
                                            type="button"
                                            onClick={() => onDeleteRegion(r)}
                                            className="ml-1 text-neutral-500 hover:text-rose-400"
                                            aria-label={`${r} 삭제`}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                                {regionList.length === 0 && (
                                    <span className="text-xs text-neutral-500">등록된 지역이 없습니다.</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={newRegion}
                                    onChange={(e) => setNewRegion(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && onAddRegion()}
                                    placeholder="새 지역 입력 (예: 미주)"
                                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={onAddRegion}
                                    disabled={saveMutation.isPending || !newRegion.trim()}
                                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-bold text-neutral-950 disabled:opacity-40"
                                >
                                    추가
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="mt-6">
                {query.isLoading ? (
                    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-6 text-sm text-neutral-300">
                        불러오는 중...
                    </div>
                ) : query.isError ? (
                    <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-6 text-sm text-rose-200">
                    불러오기 실패: {(query.error as any)?.message ?? String(query.error)}
                </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-6 text-sm text-neutral-300">
                        상품이 없습니다.
                    </div>
                ) : (
                    <>
                        {/* ✅ Mobile: Card list */}
                        <div className="grid gap-3 md:hidden">
                            {items.map((p) => (
                                <div key={p.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-xs text-neutral-400">ID {p.id}</div>
                                            <div className="mt-1 truncate text-base font-extrabold text-neutral-100">
                                                {p.title}
                                            </div>
                                            <div className="mt-1 line-clamp-2 text-sm text-neutral-400">
                                                {p.subtitle}
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-neutral-200">
                                            {p.region}
                                        </span>
                                        <span className="rounded-full border border-neutral-800 bg-neutral-950/40 px-3 py-1 text-neutral-200">
                                            최근수정 {fmtUpdatedAt(p.updatedAt)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <Link
                                            to={`/admin/products/${p.id}/basic`}
                                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-center text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                                        >
                                            수정
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(p.id)}
                                            className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ✅ Desktop: Table */}
                        <div className="hidden overflow-hidden rounded-2xl border border-neutral-900 md:block">
                            <table className="w-full table-fixed text-left text-sm">
                                <thead className="bg-neutral-950/40 text-neutral-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">제목</th>
                                    <th className="px-4 py-3 w-[88px]">지역</th>
                                    <th className="px-4 py-3 w-[96px]">상태</th>
                                    <th className="px-4 py-3 w-[140px]">최근수정</th>
                                    <th className="px-4 py-3 w-[88px] text-center">수정</th>
                                    <th className="px-4 py-3 w-[88px] text-center">삭제</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-900 bg-neutral-950/20">
                                {items.map((p) => (
                                    <tr key={p.id} className="text-neutral-200">
                                        <td className="px-4 py-3">{p.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-extrabold">{p.title}</div>
                                            <div className="mt-1 text-xs text-neutral-400 line-clamp-1">
                                                {p.subtitle}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{p.region}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-300 whitespace-nowrap">
                                            {fmtUpdatedAt(p.updatedAt)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                to={`/admin/products/${p.id}/basic`}
                                                className="
                                                        inline-flex items-center justify-center
                                                        whitespace-nowrap
                                                        min-w-[56px] h-9 px-3
                                                        rounded-lg border border-neutral-800
                                                        text-xs font-extrabold text-neutral-200
                                                        hover:bg-neutral-900
                                                    "
                                            >
                                                수정
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(p.id)}
                                                className="
                                                        inline-flex items-center justify-center
                                                        whitespace-nowrap
                                                        min-w-[56px] h-9 px-3
                                                        rounded-lg border border-neutral-800
                                                        text-xs font-extrabold text-neutral-200
                                                        hover:bg-neutral-900
                                                    "
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cls =
        status === "PUBLISHED"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : status === "HIDDEN"
                ? "bg-neutral-200 text-neutral-700 border-neutral-300"
                : "bg-amber-50 text-amber-700 border-amber-100";

    const label = status === "PUBLISHED" ? "노출" : status === "HIDDEN" ? "숨김" : "임시";

    return (
        <span
            className={[
                "inline-flex items-center justify-center",
                "whitespace-nowrap",
                "min-w-[56px] h-9 px-3",
                "rounded-full border",
                "text-xs font-extrabold",
                cls,
            ].join(" ")}
        >
            {label}
        </span>
    );
}
