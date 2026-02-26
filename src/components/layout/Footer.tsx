import { Link } from "react-router-dom";
import MobileBottomNav from "../common/MobileBottomNav";
import { useFooterSettings } from "../../hooks/useFooterSettings";

export default function Footer() {
    const { data: settings, isLoading } = useFooterSettings();

    if (isLoading || !settings) {
        return (
            <footer id="site-footer" className="mt-14 sm:mt-16 bg-neutral-50 pb-20 md:pb-0">
                <div className="border-t border-neutral-200 py-20 text-center text-sm text-neutral-400">
                    Loading...
                </div>
                <MobileBottomNav />
            </footer>
        );
    }

    return (
        <footer id="site-footer" className="mt-14 sm:mt-16 bg-neutral-50 pb-20 md:pb-0">
            {/* 고객센터 바 */}
            <div id="cs" className="border-t border-b border-neutral-200">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-base font-semibold">
                            고객센터{" "}
                            <span className="ml-2 text-[#1C8B7B]">
                                {settings.customerService.phone1} , {settings.customerService.phone2}
                            </span>
                        </div>
                        <div className="mt-1 text-sm text-neutral-500">
                            평일 09:00 ~ 18:00 · 업무시간 외 문의는 상담 채널로 남겨주세요.
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Link
                            to="/estimate"
                            className="w-full sm:w-auto rounded-lg bg-yellow-400 px-4 py-2 text-base font-bold text-neutral-900 hover:bg-yellow-300 text-center"
                        >
                            1:1 맞춤견적
                        </Link>
                        <Link
                            to="/faq"
                            className="w-full sm:w-auto rounded-lg border border-neutral-300 bg-white px-4 py-2 text-base font-semibold hover:bg-neutral-100 text-center"
                        >
                            FAQ/문의하기
                        </Link>
                    </div>
                </div>
            </div>

            {/* 하단 정보 (2번째 이미지 스타일) */}
            <div className="border-t border-neutral-200">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
                    <div className="text-sm text-neutral-500">
                        {/* 로고 */}
                        <img src={settings.logo} alt="TOUR" className="h-20 w-auto" />

                        {/* 링크 (bold) */}
                        <div className="mt-3 font-semibold text-neutral-700">
                            <a className="hover:text-neutral-900" href="/notices">
                                공지사항
                            </a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/terms">
                                이용약관
                            </a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/privacy">
                                개인정보처리방침
                            </a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/insurance">
                                해외여행자보험
                            </a>
                        </div>

                        {/* 사업자 정보: 지정한 줄 구성 */}
                        <div className="mt-5 space-y-1 leading-relaxed">
                            <div>
                                상호: {settings.companyInfo.name} · 대표: {settings.companyInfo.representative} · 주소:{" "}
                                {settings.companyInfo.address}
                            </div>
                            <div>
                                대표번호: {settings.companyInfo.phone} · 이메일: {settings.companyInfo.email} · 팩스:{" "}
                                {settings.companyInfo.fax} · 사업자등록번호: {settings.companyInfo.businessNumber} ·
                                통신판매업신고번호: {settings.companyInfo.onlineBusinessNumber}
                            </div>
                            <div>관광사업자등록번호: {settings.companyInfo.tourLicense}</div>
                        </div>

                        {/* 하단 문구 */}
                        <div className="mt-6 space-y-1">
                            <div>{settings.copyright}</div>
                            <div>{settings.poweredBy}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 하단 고정 네비게이션 */}
            <MobileBottomNav />
        </footer>
    );
}
