import { Link, useLocation, useNavigate } from "react-router-dom";

// 인라인 SVG 아이콘들
function HomeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function KakaoIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.89 5.33 4.71 6.73L5.58 21l4.08-2.51c.77.12 1.55.18 2.34.18 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
        </svg>
    );
}

function PhoneIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );
}

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const kakaoLink = "https://pf.kakao.com/";

    const handleHomeClick = () => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[99999] bg-white border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden">
            <div className="flex items-center justify-around h-16">
                {/* 홈 */}
                <button
                    type="button"
                    onClick={handleHomeClick}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
                        location.pathname === "/" ? "text-[#1C8B7B]" : "text-neutral-600"
                    }`}
                >
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">홈</span>
                </button>

                {/* 마이메뉴 */}
                <Link
                    to="/me"
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
                        location.pathname === "/me" ? "text-[#1C8B7B]" : "text-neutral-600"
                    }`}
                >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">마이메뉴</span>
                </Link>

                {/* 카카오톡 */}
                <a
                    href={kakaoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center flex-1 h-full gap-1 mx-1 rounded-lg bg-[#FEE500] text-neutral-900"
                >
                    <KakaoIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">카카오톡</span>
                </a>

                {/* 전화하기 */}
                <a
                    href="tel:01086888810"
                    className="flex flex-col items-center justify-center flex-1 h-full gap-1 mx-1 rounded-lg bg-blue-500 text-white"
                >
                    <PhoneIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">전화하기</span>
                </a>
            </div>
        </nav>
    );
}
