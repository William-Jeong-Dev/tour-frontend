import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductRegions, saveProductRegions } from "../../api/siteSettings.api";

export default function AdminRegions() {
    const qc = useQueryClient();
    const [newName, setNewName] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["product-regions"],
        queryFn: getProductRegions,
        staleTime: 30_000,
    });

    const regions = data ?? [];

    const saveMutation = useMutation({
        mutationFn: saveProductRegions,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["product-regions"] }),
    });

    const onAdd = async () => {
        const trimmed = newName.trim();
        if (!trimmed || regions.includes(trimmed)) return;
        await saveMutation.mutateAsync([...regions, trimmed]);
        setNewName("");
    };

    const onDelete = async (name: string) => {
        if (!confirm(`"${name}" 지역을 삭제할까요?\n이 지역이 지정된 상품의 region 값은 그대로 유지됩니다.`)) return;
        await saveMutation.mutateAsync(regions.filter((r) => r !== name));
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onAdd();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <div className="text-xl font-extrabold text-neutral-100">지역(레거시) 관리</div>
                    <div className="mt-1 text-xs text-neutral-400">
                        상품 편집 폼의 지역(레거시 region) 드롭다운 목록을 관리합니다.
                    </div>
                </div>
            </div>

            {/* 추가 폼 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="mb-3 text-sm font-bold text-neutral-200">새 지역 추가</div>
                <div className="flex gap-2">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="지역명 입력 (예: 미주, 호주)"
                        className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2.5 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                    />
                    <button
                        type="button"
                        onClick={onAdd}
                        disabled={saveMutation.isPending || !newName.trim() || regions.includes(newName.trim())}
                        className="rounded-xl bg-[#2E97F2] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"
                    >
                        추가
                    </button>
                </div>
                {regions.includes(newName.trim()) && newName.trim() && (
                    <div className="mt-2 text-xs text-rose-400">이미 존재하는 지역입니다.</div>
                )}
            </div>

            {/* 지역 목록 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                <div className="mb-3 text-sm font-bold text-neutral-200">
                    등록된 지역 <span className="ml-1 text-neutral-500">({regions.length})</span>
                </div>

                {isLoading ? (
                    <div className="text-sm text-neutral-400">불러오는 중...</div>
                ) : regions.length === 0 ? (
                    <div className="text-sm text-neutral-500">등록된 지역이 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800 text-xs text-neutral-500">
                                    <th className="pb-2 pr-4 font-medium">#</th>
                                    <th className="pb-2 font-medium">지역명</th>
                                    <th className="pb-2 text-right font-medium">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                                {regions.map((name, idx) => (
                                    <tr key={name} className="text-neutral-200">
                                        <td className="py-3 pr-4 text-xs text-neutral-500">{idx + 1}</td>
                                        <td className="py-3 font-semibold">{name}</td>
                                        <td className="py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(name)}
                                                disabled={saveMutation.isPending}
                                                className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/30 disabled:opacity-40"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
