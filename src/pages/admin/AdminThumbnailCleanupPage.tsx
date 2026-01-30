import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteThumbCleanup, previewThumbCleanup, } from "../../api/thumbCleanup.api";

type Row = {
    path: string;
    deletable: boolean;
    type: "DRAFT_REF" | "ORPHAN";
};

export default function AdminThumbnailCleanupPage() {
    const previewQ = useQuery({
        queryKey: ["thumb-cleanup"],
        queryFn: previewThumbCleanup,
    });

    const delM = useMutation({
        mutationFn: deleteThumbCleanup,
        onSuccess: () => {
            setSelected({});
            previewQ.refetch();
        },
    });

    /** =========================
     * 안전한 기본값 세팅
     * ========================= */
    const rows: Row[] = previewQ.data?.rows ?? [];
    const publicBaseUrl: string = previewQ.data?.publicBaseUrl ?? "";

    const storage = previewQ.data?.storage ?? {
        usedBytes: 0,
        quotaBytes: 500 * 1024 * 1024,
        totalFiles: 0,
    };

    /** =========================
     * selection logic
     * ========================= */
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const selectedPaths = useMemo(
        () => Object.keys(selected).filter((k) => selected[k]),
        [selected],
    );

    const usedMB = (storage.usedBytes / 1024 / 1024).toFixed(1);
    const quotaMB = (storage.quotaBytes / 1024 / 1024).toFixed(0);
    const usagePercent =
        storage.quotaBytes > 0
            ? Math.min(100, (storage.usedBytes / storage.quotaBytes) * 100)
            : 0;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-6 text-gray-100">
            <h1 className="text-xl font-semibold mb-2">썸네일 정리</h1>

            {/* =========================
          Summary Cards
         ========================= */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <Card label="후보 파일">{rows.length}</Card>

                <Card label="삭제 가능">
                    {rows.filter((r) => r.deletable).length}
                </Card>

                <Card label="보호">
                    {rows.filter((r) => !r.deletable).length}
                </Card>

                <Card label="스토리지 사용량">
                    <div className="text-sm">
                        {usedMB}MB / {quotaMB}MB
                    </div>
                    <div className="mt-2 h-2 rounded bg-gray-800 overflow-hidden">
                        <div
                            className="h-2 bg-green-500"
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        파일 {storage.totalFiles}개 · {usagePercent.toFixed(1)}%
                    </div>
                </Card>
            </div>

            {/* =========================
          Actions
         ========================= */}
            <div className="mb-4 flex gap-2">
                <button
                    className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700"
                    onClick={() => previewQ.refetch()}
                    disabled={previewQ.isFetching}
                >
                    검증 다시하기
                </button>

                <button
                    className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-40"
                    disabled={!selectedPaths.length || delM.isPending}
                    onClick={() => delM.mutate(selectedPaths)}
                >
                    선택 삭제
                </button>
            </div>

            {/* =========================
          Table
         ========================= */}
            <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-900">
                    <tr>
                        <th className="p-3 w-10"></th>
                        <th className="p-3 w-24">썸네일</th>
                        <th className="p-3">path</th>
                        <th className="p-3 w-24">삭제 가능</th>
                    </tr>
                    </thead>

                    <tbody>
                    {previewQ.isLoading && (
                        <tr>
                            <td colSpan={4} className="p-4 text-gray-400">
                                불러오는 중...
                            </td>
                        </tr>
                    )}

                    {!previewQ.isLoading &&
                        rows.map((r) => (
                            <tr key={r.path} className="border-t border-gray-800">
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        disabled={!r.deletable}
                                        checked={!!selected[r.path]}
                                        onChange={() =>
                                            setSelected((s) => ({
                                                ...s,
                                                [r.path]: !s[r.path],
                                            }))
                                        }
                                    />
                                </td>

                                <td className="p-3">
                                    {publicBaseUrl ? (
                                        <img
                                            src={`${publicBaseUrl}${r.path}`}
                                            alt="thumb"
                                            className="w-16 h-16 object-cover rounded border border-gray-700"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-500">-</span>
                                    )}
                                </td>

                                <td className="p-3 font-mono text-xs break-all">
                                    {r.path}
                                </td>

                                <td className="p-3">
                                    {r.deletable ? (
                                        <span className="text-green-400">가능</span>
                                    ) : (
                                        <span className="text-red-400">보호</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                    {!previewQ.isLoading && rows.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-4 text-gray-400">
                                정리할 후보가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/** =========================
 * Small Card Component
 * ========================= */
function Card({
                  label,
                  children,
              }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-gray-800 rounded-xl p-4 bg-gray-950/40">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-lg font-semibold">{children}</div>
        </div>
    );
}


