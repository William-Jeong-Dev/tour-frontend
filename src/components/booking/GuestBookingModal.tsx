import { useState, useEffect } from "react";
import { createBooking, sendBookingEmail } from "../../api/bookings.api";
import BookingConfirmationModal from "./BookingConfirmationModal";
import { supabase } from "../../lib/supabase";

type GuestBookingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bookingInfo: {
        productId: string;
        productTitle: string;
        travelDate: string;
        peopleCount: number;
        memo: string;
    };
    userId?: string | null; // 로그인된 사용자 ID (선택)
    initialName?: string; // 회원의 기존 이름
    initialPhone?: string; // 회원의 기존 전화번호
    initialEmail?: string; // 회원의 기존 이메일
    showInputFields?: boolean; // true면 입력 필드 표시, false면 숨김 (정보가 있는 회원)
};

export default function GuestBookingModal({
    isOpen,
    onClose,
    onSuccess,
    bookingInfo,
    userId = null,
    initialName = "",
    initialPhone = "",
    initialEmail = "",
    showInputFields = true,
}: GuestBookingModalProps) {
    const [name, setName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    const [email, setEmail] = useState(initialEmail);
    const [submitting, setSubmitting] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationData, setConfirmationData] = useState<{
        bookingId?: string;
        productTitle: string;
        travelDate: string;
        peopleCount: number;
        customerName: string;
        customerPhone: string;
        totalPrice: number | null;
    } | null>(null);

    // 초기값이 변경되면 state 업데이트
    useEffect(() => {
        setName(initialName);
        setPhone(initialPhone);
        setEmail(initialEmail);
    }, [initialName, initialPhone, initialEmail]);

    if (!isOpen) return null;

    const handleConfirmationClose = () => {
        setShowConfirmationModal(false);
        setConfirmationData(null);
        onSuccess(); // 성공 후 처리 (폼 초기화 등)
        onClose(); // 게스트 예약 모달 닫기
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !phone.trim()) {
            alert("이름과 연락처는 필수 항목입니다.");
            return;
        }

        if (!privacyAgreed) {
            alert("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        try {
            setSubmitting(true);

            // 로그인된 사용자의 경우 프로필 업데이트
            if (userId) {
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ name: name.trim(), phone: phone.trim() })
                    .eq("user_id", userId);

                if (updateError) throw updateError;
            }

            // DB에 예약 데이터 insert (로그인 사용자는 user_id 포함, 비회원은 null)
            const bookingResult = await createBooking(userId, {
                product_id: bookingInfo.productId,
                travel_date: bookingInfo.travelDate,
                people_count: bookingInfo.peopleCount,
                contact_name: name.trim(),
                contact_phone: phone.trim(),
                memo_user: bookingInfo.memo,
            });

            // 메일 전송
            await sendBookingEmail({
                product_title: bookingInfo.productTitle,
                user_name: name.trim(),
                user_phone: phone.trim(),
                user_email: email.trim() || null,
                travel_date: bookingInfo.travelDate,
                people_count: bookingInfo.peopleCount,
                memo_user: bookingInfo.memo,
            });

            // 예약 확인 모달 데이터 설정
            setConfirmationData({
                bookingId: bookingResult?.id,
                productTitle: bookingInfo.productTitle,
                travelDate: bookingInfo.travelDate,
                peopleCount: bookingInfo.peopleCount,
                customerName: name.trim(),
                customerPhone: phone.trim(),
                totalPrice: null,
            });
            setShowConfirmationModal(true);
        } catch (e: any) {
            alert(e?.message ?? "예약 접수에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                    <h2 className="text-xl font-extrabold text-neutral-900">
                        {showInputFields ? "예약 요청" : "예약 확인"}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        {showInputFields
                            ? "예약 정보를 입력해주세요. 담당자가 확인 후 연락드립니다."
                            : "예약 전 동의 사항을 확인해주세요."}
                    </p>

                    <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                        <div className="text-xs font-semibold text-neutral-500">예약 정보</div>
                        <div className="mt-2 space-y-1 text-sm text-neutral-800">
                            <div>상품: {bookingInfo.productTitle}</div>
                            <div>출발일: {bookingInfo.travelDate}</div>
                            <div>인원: {bookingInfo.peopleCount}명</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {showInputFields && (
                            <>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-600">
                                        이름 (필수)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="홍길동"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-600">
                                        연락처 (필수)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="010-1234-5678"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-600">
                                        이메일 (선택)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </>
                        )}

                        {/* 개인정보 수집 및 이용 동의 (필수) */}
                        <div className="mt-4">
                            <div className="rounded-xl border border-neutral-200 p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={privacyAgreed}
                                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                        className="mt-1 h-4 w-4 accent-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-neutral-800">
                                            개인정보 수집 및 이용 동의 (필수)
                                        </span>
                                    </div>
                                </label>
                                <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 leading-relaxed">
                                    <p className="font-semibold mb-2">청원여행사는 예약 문의 및 여행 상담을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>

                                    <p className="font-semibold mt-3">1. 수집 항목</p>
                                    <p>- 필수 항목: 이름, 휴대전화번호, 여행 일정 정보</p>
                                    <p>- 선택 항목: 이메일</p>

                                    <p className="font-semibold mt-3">2. 수집 및 이용 목적</p>
                                    <p>- 여행 상담 및 예약 진행 관리</p>
                                    <p>- 여행 일정 안내</p>
                                    <p>- 고객 문의 응대 및 민원 처리</p>

                                    <p className="font-semibold mt-3">3. 보유 및 이용 기간</p>
                                    <p>- 상담 및 여행 진행 종료 후 즉시 파기</p>
                                    <p>- 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관</p>

                                    <p className="mt-3 text-neutral-500">※ 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 필수 항목에 대한 동의를 거부할 경우 예약 접수가 제한될 수 있습니다.</p>
                                </div>
                            </div>
                        </div>

                        {/* 마케팅 정보 수신 동의 (선택) */}
                        <div>
                            <div className="rounded-xl border border-neutral-200 p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={marketingAgreed}
                                        onChange={(e) => setMarketingAgreed(e.target.checked)}
                                        className="mt-1 h-4 w-4 accent-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-neutral-800">
                                            마케팅 정보 수신 동의 (선택)
                                        </span>
                                    </div>
                                </label>
                                <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 leading-relaxed">
                                    <p className="font-semibold mb-2">청원여행사는 신규 여행 상품, 프로모션, 이벤트 및 할인 정보 등을 문자(SMS), 카카오톡, 이메일 등을 통해 안내드릴 수 있습니다.</p>

                                    <p className="font-semibold mt-3">1. 수집 항목</p>
                                    <p>- 이름, 휴대전화번호, 이메일</p>

                                    <p className="font-semibold mt-3">2. 이용 목적</p>
                                    <p>- 신규 여행 상품 안내</p>
                                    <p>- 이벤트 및 프로모션 정보 제공</p>
                                    <p>- 맞춤형 여행 상품 추천</p>

                                    <p className="font-semibold mt-3">3. 보유 및 이용 기간</p>
                                    <p>- 동의 철회 시까지</p>

                                    <p className="mt-3 text-neutral-500">※ 귀하는 마케팅 정보 수신에 대한 동의를 거부할 권리가 있으며, 동의를 거부하셔도 예약 서비스 이용에는 제한이 없습니다.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-xl bg-[#2E97F2] px-4 py-3 text-sm font-extrabold text-white hover:brightness-95 disabled:opacity-60"
                            >
                                {submitting ? "전송 중..." : "예약 요청"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 예약 확인 모달 */}
            {confirmationData && (
                <BookingConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={handleConfirmationClose}
                    bookingData={confirmationData}
                />
            )}
        </>
    );
}
