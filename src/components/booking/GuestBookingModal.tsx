import { useState } from "react";
import { sendBookingEmail } from "../../api/bookings.api";

type GuestBookingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bookingInfo: {
        productTitle: string;
        travelDate: string;
        peopleCount: number;
        memo: string;
    };
};

export default function GuestBookingModal({
    isOpen,
    onClose,
    onSuccess,
    bookingInfo,
}: GuestBookingModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !phone.trim()) {
            alert("이름과 연락처는 필수 항목입니다.");
            return;
        }

        try {
            setSubmitting(true);

            await sendBookingEmail({
                product_title: bookingInfo.productTitle,
                user_name: name.trim(),
                user_phone: phone.trim(),
                user_email: email.trim() || null,
                travel_date: bookingInfo.travelDate,
                people_count: bookingInfo.peopleCount,
                memo_user: bookingInfo.memo,
            });

            alert("예약 요청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.");
            onSuccess();
        } catch (e: any) {
            alert(e?.message ?? "예약 접수에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-extrabold text-neutral-900">비회원 예약 요청</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    예약 정보를 입력해주세요. 담당자가 확인 후 연락드립니다.
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
    );
}
