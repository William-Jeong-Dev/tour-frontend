import { useEffect, useState } from "react";
import KakaoEmoji from "../../assets/kakao.png";

export default function KakaoFloating() {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const sentinel = document.getElementById("top-sentinel");
        if (!sentinel) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                // ✅ sentinel이 화면에 안 보이면(= 아래로 내려감) 화살표 표시
                setShowTop(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        io.observe(sentinel);
        return () => io.disconnect();
    }, []);

    const goTop = () => {
        const el = document.getElementById("page-top");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        setShowTop(false);
    };

    function getScrollContainer(): HTMLElement | null {
        // 가장 흔한 케이스: main이 overflow로 스크롤 되는 경우
        const main = document.querySelector("main");
        if (main instanceof HTMLElement) {
            const st = getComputedStyle(main);
            if ((st.overflowY === "auto" || st.overflowY === "scroll") && main.scrollHeight > main.clientHeight) {
                return main;
            }
        }

        // 그 외: 스크롤 가능한 엘리먼트 탐색
        const all = Array.from(document.querySelectorAll("body *"));
        for (const el of all) {
            if (!(el instanceof HTMLElement)) continue;
            const st = getComputedStyle(el);
            if ((st.overflowY === "auto" || st.overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
                return el;
            }
        }
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-center gap-3">
            <button
                type="button"
                onClick={goTop}
                aria-label="맨 위로"
                className={[
                    "h-12 w-12 rounded-full bg-white shadow-lg ring-1 ring-black/10 hover:bg-neutral-50 active:scale-[0.98] transition",
                    showTop
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 pointer-events-none",
                ].join(" ")}
            >
                <span className="text-xl font-extrabold text-neutral-800">↑</span>
            </button>

            <button
                type="button"
                aria-label="카카오 상담"
                className="h-14 w-14 rounded-full bg-[#FEE500] shadow-lg ring-1 ring-black/10 hover:brightness-95 active:scale-[0.98] transition"
            >
                <img src={KakaoEmoji} alt="Kakao" className="mx-auto h-9 w-9 object-contain" />
            </button>
        </div>
    );
}
