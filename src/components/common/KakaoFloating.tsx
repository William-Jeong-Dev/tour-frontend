import { useEffect, useState } from "react";
import KakaoEmoji from "../../assets/kakao.png";
import PhoneIcon from "../../assets/phone.png";

export default function KakaoFloating() {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const sentinel = document.getElementById("top-sentinel");
        if (!sentinel) return;

        const io = new IntersectionObserver(
            ([entry]) => {
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

    return (
        <>
            {/* 모바일 맨 위로 버튼 - 하단 네비게이션 바 위에 위치 */}
            <button
                type="button"
                onClick={goTop}
                aria-label="맨 위로"
                className={[
                    "fixed right-4 bottom-20 z-[99998] md:hidden",
                    "h-10 w-10 rounded-full bg-white shadow-lg ring-1 ring-black/10 hover:bg-neutral-50 active:scale-[0.98] transition",
                    showTop
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 pointer-events-none",
                ].join(" ")}
            >
                <span className="text-lg font-extrabold text-neutral-800">↑</span>
            </button>

            {/* PC 플로팅 버튼들 */}
            <div className="fixed bottom-6 right-6 z-[99999] hidden md:flex flex-col items-center gap-3">
                {/* 맨 위로 */}
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

                {/* 카카오 */}
                <a
                    href="http://pf.kakao.com/_qFxdqX/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="카카오 상담"
                    className="h-14 w-14 rounded-full bg-[#FEE500] shadow-lg ring-1 ring-black/10 hover:brightness-95 active:scale-[0.98] transition flex items-center justify-center"
                >
                    <img src={KakaoEmoji} alt="Kakao" className="h-9 w-9 object-contain" />
                </a>

                {/* 전화 */}
                <a
                    href="tel:01086888810"
                    aria-label="전화 상담"
                    className="h-14 w-14 rounded-full bg-blue-500 shadow-lg hover:brightness-95 active:scale-[0.98] transition flex items-center justify-center"
                >
                    <img
                        src={PhoneIcon}
                        alt="Phone"
                        className="h-9 w-9 object-contain"
                        draggable={false}
                    />
                </a>
            </div>
        </>
    );
}
