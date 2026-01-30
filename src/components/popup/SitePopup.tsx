import { useMemo } from "react";

type Props = {
    id: string;
    title: string;
    leftPx: number;
    topPx: number;
    widthPx: number;
    contentHtml: string;
    onClose: () => void;
    onHideToday?: () => void;
};

export default function SitePopup(props: Props) {
    const style = useMemo(() => {
        const w = Math.max(240, props.widthPx || 400);
        return { width: w } as React.CSSProperties;
    }, [props.widthPx]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(e) => {
                // 바깥 영역 클릭하면 닫기 (원하면 삭제 가능)
                if (e.target === e.currentTarget) props.onClose();
            }}
        >
            <div
                className="relative max-h-[85vh] overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-xl"
                style={style}
            >
                {/* 헤더 */}
                <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
                    <div className="text-sm font-extrabold text-neutral-900">
                        {props.title || "팝업"}
                    </div>
                    <button
                        type="button"
                        onClick={props.onClose}
                        className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                        닫기
                    </button>
                </div>

                {/* 내용 */}
                <div className="px-4 py-4">
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: props.contentHtml || "" }}
                    />
                </div>

                {/* 하단 */}
                <div className="flex items-center justify-between border-t bg-white px-4 py-3">
                    <button
                        type="button"
                        onClick={() => {
                            props.onHideToday?.();
                            props.onClose();
                        }}
                        className="text-xs font-bold text-neutral-600 hover:underline"
                    >
                        오늘 하루 보지 않기
                    </button>

                    <button
                        type="button"
                        onClick={props.onClose}
                        className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-extrabold text-white"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
