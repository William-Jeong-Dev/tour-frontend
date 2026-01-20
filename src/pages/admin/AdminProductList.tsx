import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { deleteProduct, listProducts } from "../../api/products.api";

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
    const [q, setQ] = useState("");
    const [region, setRegion] = useState("전체");

    const query = useQuery({
        queryKey: ["admin-products", { q, region }],
        queryFn: () => listProducts({ q, region }),
    });

    const items = query.data ?? [];
    const regions = useMemo(() => ["전체", "일본", "제주", "동남아", "유럽"], []);

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
            <div className="mt-6 grid gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/20 p-4 md:grid-cols-[1fr_180px]">
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
                    <div className="mb-2 text-sm text-neutral-300">지역</div>
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

            {/* Content */}
            <div className="mt-6">
                {query.isLoading ? (
                    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-6 text-sm text-neutral-300">
                        불러오는 중...
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
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-950/40 text-neutral-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">제목</th>
                                    <th className="px-4 py-3">지역</th>
                                    <th className="px-4 py-3">상태</th>
                                    <th className="px-4 py-3">최근수정</th>
                                    <th className="px-4 py-3">수정</th>
                                    <th className="px-4 py-3">삭제</th>
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
                                        <td className="px-4 py-3 text-xs text-neutral-300">
                                            {fmtUpdatedAt(p.updatedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/admin/products/${p.id}/basic`}
                                                className="rounded-lg border border-neutral-800 px-3 py-1 text-xs font-extrabold text-neutral-200 hover:bg-neutral-900"
                                            >
                                                수정
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(p.id)}
                                                className="rounded-lg border border-neutral-800 px-3 py-1 text-xs font-extrabold text-neutral-200 hover:bg-neutral-900"
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
            ? "bg-emerald-50 text-emerald-700"
            : status === "HIDDEN"
                ? "bg-neutral-200 text-neutral-700"
                : "bg-amber-50 text-amber-700";

    const label = status === "PUBLISHED" ? "노출" : status === "HIDDEN" ? "숨김" : "임시";

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${cls}`}>{label}</span>;
}
