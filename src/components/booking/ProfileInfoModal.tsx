import { useState } from "react";

type ProfileInfoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, phone: string) => Promise<void>;
    initialName?: string;
    initialPhone?: string;
};

export default function ProfileInfoModal({
    isOpen,
    onClose,
    onSubmit,
    initialName = "",
    initialPhone = "",
}: ProfileInfoModalProps) {
    const [name, setName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
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
            await onSubmit(name.trim(), phone.trim());
        } catch (e: any) {
            alert(e?.message ?? "정보 저장에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-extrabold text-neutral-900">회원 정보 입력</h2>
                <p className="mt-2 text-sm text-neutral-600">
                    예약을 위해 이름과 연락처가 필요합니다. 입력하신 정보는 회원 프로필에 저장됩니다.
                </p>

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
                            autoFocus
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
                            {submitting ? "저장 중..." : "확인"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
