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

function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function SitePopup(props: Props) {
    const style = useMemo(() => {
        const w = Math.max(240, props.widthPx || 400);
        const l = Number.isFinite(props.leftPx) ? props.leftPx : 0;
        const t = Number.isFinite(props.topPx) ? props.topPx : 0;

        // ✅ 팝업 위치를 left/top 기준으로 고정
        return {
            position: "fixed",
            left: l,
            top: t,
            width: w,
            zIndex: 100,
        } as React.CSSProperties;
    }, [props.widthPx, props.leftPx, props.topPx]);

    const handleHideToday = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // 1) 외부에서 hideToday 로직을 주입했으면 우선 실행
        if (props.onHideToday) {
            try {
                props.onHideToday();
            } finally {
                // 2) ✅ 무조건 닫기 (핵심)
                props.onClose();
            }
            return;
        }

        // 2) 없으면 기본 동작: localStorage에 오늘 날짜 저장
        try {
            const key = `popup_hide_${props.id}`;
            localStorage.setItem(key, todayKey());
        } catch {
            // localStorage 막힌 환경이어도 닫기는 되게
        } finally {
            // 3) ✅ 무조건 닫기 (핵심)
            props.onClose();
        }
    };

    return (
        // ✅ 배경 오버레이/블러 제거
        <div style={style}>
            <div className="relative max-h-[85vh] overflow-auto rounded-2xl border border-neutral-200 bg-white shadow-xl">
                {/* 헤더 */}
                <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
                    <div className="text-sm font-extrabold text-neutral-900">{props.title}</div>
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
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: props.contentHtml || "" }} />
                </div>

                {/* 하단 */}
                <div className="flex items-center justify-between border-t bg-white px-4 py-3">
                    <button
                        type="button"
                        onClick={handleHideToday}
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