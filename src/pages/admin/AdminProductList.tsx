import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../api/products.api";
import { useAdminProducts, useAdminProductsFilter } from "../../hooks/useAdminProducts";

export default function AdminProductList() {
    const qc = useQueryClient();
    const { data } = useAdminProducts();
    const { q, setQ, region, setRegion } = useAdminProductsFilter();

    const del = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });

    return (
        <div>
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-semibold">상품 관리</div>
                    <div className="mt-1 text-sm text-neutral-300">등록/수정/삭제</div>
                </div>
                <Link
                    to="/admin/products/new"
                    className="rounded-xl bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950"
                >
                    + 새 상품
                </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="검색어"
                    className="w-64 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                />
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm outline-none"
                >
                    {["전체", "일본", "제주", "동남아", "유럽"].map((x) => (
                        <option key={x} value={x}>{x}</option>
                    ))}
                </select>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-900">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-950/60 text-neutral-300">
                    <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">제목</th>
                        <th className="px-4 py-3">지역</th>
                        <th className="px-4 py-3">가격</th>
                        <th className="px-4 py-3 text-right">액션</th>
                    </tr>
                    </thead>
                    <tbody className="bg-neutral-900/10">
                    {(data ?? []).map((p) => (
                        <tr key={p.id} className="border-t border-neutral-900">
                            <td className="px-4 py-3 text-neutral-300">{p.id}</td>
                            <td className="px-4 py-3">
                                <div className="font-semibold">{p.title}</div>
                                <div className="text-neutral-400">{p.subtitle}</div>
                            </td>
                            <td className="px-4 py-3 text-neutral-300">{p.region}</td>
                            <td className="px-4 py-3 text-neutral-300">{p.priceText}</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/admin/products/${p.id}`}
                                        className="rounded-xl border border-neutral-800 px-3 py-1.5 text-neutral-200 hover:bg-neutral-900"
                                    >
                                        수정
                                    </Link>
                                    <button
                                        onClick={() => del.mutate(p.id)}
                                        className="rounded-xl border border-neutral-800 px-3 py-1.5 text-neutral-200 hover:bg-neutral-900"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(data?.length ?? 0) === 0 && (
                        <tr>
                            <td className="px-4 py-10 text-center text-neutral-400" colSpan={5}>
                                데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
