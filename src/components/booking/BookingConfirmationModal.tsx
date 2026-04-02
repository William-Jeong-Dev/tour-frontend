import { useState } from "react";

type BookingConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    bookingData: {
        bookingId?: string;
        productTitle: string;
        travelDate: string;
        peopleCount: number;
        customerName: string;
        customerPhone: string;
        totalPrice: number | null;
    };
};

export default function BookingConfirmationModal({
    isOpen,
    onClose,
    bookingData,
}: BookingConfirmationModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyBookingId = async () => {
        if (!bookingData.bookingId) return;

        try {
            await navigator.clipboard.writeText(bookingData.bookingId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("복사 실패:", err);
        }
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return "가격문의";
        return `${price.toLocaleString("ko-KR")}원`;
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* 헤더 */}
                <div className="sticky top-0 bg-[#2E97F2] px-6 py-5 rounded-t-2xl">
                    <h2 className="text-lg font-extrabold text-white">예약 요청 상세 내역</h2>
                    <p className="mt-1 text-sm text-white/90">
                        예약 요청하신 상품의 상세 내역입니다.
                    </p>
                </div>

                {/* 본문 */}
                <div className="p-6 space-y-6">
                    {/* 예약 신청 정보 */}
                    <section>
                        <h3 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
                            예약 신청 정보
                        </h3>
                        <div className="mt-4 space-y-3 text-sm">
                            <div>
                                <div className="text-xs text-neutral-500">상품명</div>
                                <div className="mt-1 font-semibold text-neutral-900">
                                    {bookingData.productTitle}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500">예약 인원</div>
                                <div className="mt-1 font-semibold text-neutral-900">
                                    성인 {bookingData.peopleCount}명
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500">여행 날짜</div>
                                <div className="mt-1 font-semibold text-neutral-900">
                                    {bookingData.travelDate}
                                </div>
                            </div>

                            {bookingData.bookingId && (
                                <div>
                                    <div className="text-xs text-neutral-500">예약 신청 번호</div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="flex-1 font-mono text-xs text-neutral-700 break-all">
                                            {bookingData.bookingId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyBookingId}
                                            className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                        >
                                            {copied ? "✓ 복사됨" : "복사"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 여행자 정보 */}
                    <section>
                        <h3 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
                            여행자 정보
                        </h3>
                        <div className="mt-4 space-y-3 text-sm">
                            <div>
                                <div className="text-xs text-neutral-500">예약 신청자</div>
                                <div className="mt-1 font-semibold text-neutral-900">
                                    {bookingData.customerName}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500">연락처</div>
                                <div className="mt-1 font-semibold text-neutral-900">
                                    {bookingData.customerPhone}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 예약 상품 금액 */}
                    <section>
                        <h3 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
                            예약 상품 금액
                        </h3>
                        <div className="mt-4">
                            <div className="flex items-baseline justify-between rounded-xl bg-neutral-50 p-4">
                                <span className="text-sm font-semibold text-neutral-600">총 예상 금액</span>
                                <span className="text-xl font-extrabold text-neutral-900">
                                    {formatPrice(bookingData.totalPrice)}
                                </span>
                            </div>
                            {bookingData.totalPrice !== null && (
                                <p className="mt-2 text-xs text-neutral-500">
                                    * 최종 금액은 담당자 확인 후 안내드립니다.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* 문의 버튼 */}
                    <div className="space-y-3">
                        <a
                            href="http://pf.kakao.com/_qFxdqX/chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full rounded-xl bg-[#FEE500] px-6 py-3 text-center text-sm font-extrabold text-neutral-900 hover:brightness-95"
                        >
                            카톡 문의하기
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                        >
                            닫기
                        </button>
                    </div>

                    {/* 전화 문의 */}
                    <a
                        href="tel:01086888810"
                        className="block text-center text-sm font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                        전화문의: 010-8688-8810
                    </a>
                </div>
            </div>
        </div>
    );
}
