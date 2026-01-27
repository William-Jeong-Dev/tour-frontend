import { useEffect, useState } from "react";
import {
    useLogoUrl,
    useUploadLogoAndSave,
    usePrimaryColor,
    useUpdatePrimaryColor,
} from "../../hooks/useSiteBranding";

export default function AdminBranding() {
    const logoQuery = useLogoUrl();
    const uploadMut = useUploadLogoAndSave();
    const [file, setFile] = useState<File | null>(null);

    // ✅ primary color
    const primaryColorQuery = usePrimaryColor();
    const updateColorMut = useUpdatePrimaryColor();
    const [color, setColor] = useState("");

    useEffect(() => {
        // 최초 로딩 시 입력값 채우기 (사용자가 입력 시작했으면 덮어쓰지 않음)
        if (!color && primaryColorQuery.data) {
            setColor(primaryColorQuery.data);
        }
    }, [primaryColorQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

    const onUpload = async () => {
        if (!file) return;
        await uploadMut.mutateAsync(file);
        setFile(null);
    };

    const onSaveColor = () => {
        const v = color.trim();
        if (!v) return;
        updateColorMut.mutate(v);
    };

    return (
        <div className="space-y-4">
            <div>
                <div className="text-lg font-extrabold">브랜딩 설정</div>
                <div className="text-sm text-neutral-400">헤더 로고/색상을 관리합니다.</div>
            </div>

            {/* ✅ 현재 로고 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200">현재 로고</div>
                <div className="mt-3 flex items-center justify-center rounded-xl bg-black/40 p-4">
                    {logoQuery.data ? (
                        <img src={logoQuery.data} alt="로고" className="h-12 w-auto max-w-[260px] object-contain" />
                    ) : (
                        <div className="text-xs text-neutral-500">등록된 로고가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* ✅ 메인 컬러 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200">메인 컬러</div>
                <p className="mt-2 text-xs text-neutral-400">
                    Header 배경색으로 사용됩니다. (예: #2E97F2)
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-xl border border-neutral-800"
                            style={{ backgroundColor: color || "#2E97F2" }}
                            title={color || "#2E97F2"}
                        />
                        <input
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="#2E97F2"
                            className="w-[220px] rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onSaveColor}
                        disabled={!color.trim() || updateColorMut.isPending}
                        className="whitespace-nowrap min-w-[110px] rounded-xl bg-neutral-50 px-4 py-2 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                    >
                        {updateColorMut.isPending ? "저장 중..." : "저장"}
                    </button>
                </div>

                {updateColorMut.isError ? (
                    <div className="mt-3 text-xs text-red-400">
                        저장 실패: {(updateColorMut.error as any)?.message ?? "unknown error"}
                    </div>
                ) : null}

                {updateColorMut.isSuccess ? <div className="mt-3 text-xs text-green-400">저장 완료!</div> : null}
            </div>

            {/* ✅ 로고 업로드 */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                <div className="text-sm font-extrabold text-neutral-200">로고 업로드</div>
                <p className="mt-2 text-xs text-neutral-400">
                    권장: SVG(투명) 또는 PNG(투명) / 헤더 표시 높이 40px 기준
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-200"
                    />
                    <button
                        type="button"
                        onClick={onUpload}
                        disabled={!file || uploadMut.isPending}
                        className="whitespace-nowrap min-w-[110px] rounded-xl bg-neutral-50 px-4 py-2 text-sm font-extrabold text-neutral-950 disabled:opacity-50"
                    >
                        {uploadMut.isPending ? "업로드 중..." : "업로드 / 적용"}
                    </button>
                </div>

                {uploadMut.isError ? (
                    <div className="mt-3 text-xs text-red-400">
                        업로드 실패: {(uploadMut.error as any)?.message ?? "unknown error"}
                    </div>
                ) : null}

                {uploadMut.isSuccess ? <div className="mt-3 text-xs text-green-400">적용 완료!</div> : null}
            </div>
        </div>
    );
}
