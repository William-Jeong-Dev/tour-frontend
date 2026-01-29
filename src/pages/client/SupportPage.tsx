import { useMemo, useState } from "react";
import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";
import { createInquiry } from "../../api/inquiries.api";

export default function SupportPage() {
    const [contactName, setContactName] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactEmail, setContactEmail] = useState("");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const canSubmit = useMemo(() => {
        return (
            contactName.trim().length > 0 &&
            contactPhone.trim().length > 0 &&
            title.trim().length > 0 &&
            content.trim().length > 0 &&
            !saving
        );
    }, [contactName, contactPhone, title, content, saving]);

    const onSubmit = async () => {
        setMsg(null);

        if (!contactName.trim()) {
            setMsg({ type: "err", text: "이름을 입력해주세요." });
            return;
        }
        if (!contactPhone.trim()) {
            setMsg({ type: "err", text: "연락처를 입력해주세요." });
            return;
        }
        if (!title.trim()) {
            setMsg({ type: "err", text: "제목을 입력해주세요." });
            return;
        }
        if (!content.trim()) {
            setMsg({ type: "err", text: "문의 내용을 입력해주세요." });
            return;
        }

        setSaving(true);
        try {
            await createInquiry({
                contactName,
                contactPhone,
                contactEmail,
                title,
                content,
            });

            setMsg({ type: "ok", text: "문의가 접수되었습니다. 빠르게 연락드릴게요 ✅" });

            // 입력 초기화
            setTitle("");
            setContent("");
            // 연락처는 유지하고 싶으면 아래 3줄은 주석 처리
            setContactName("");
            setContactPhone("");
            setContactEmail("");
        } catch (e: any) {
            setMsg({ type: "err", text: `접수 실패: ${e?.message ?? String(e)}` });
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        <ServiceSideNav title="고객센터" />

                        <section className="col-span-12 md:col-span-9">
                            <h1 className="text-2xl font-extrabold text-neutral-900">문의하기</h1>
                            <p className="mt-2 text-sm text-neutral-500">문의 내용을 남겨주시면 빠르게 답변 드릴게요.</p>

                            {msg ? (
                                <div
                                    className={[
                                        "mt-4 rounded-2xl border p-4 text-sm",
                                        msg.type === "ok"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : "border-red-200 bg-red-50 text-red-700",
                                    ].join(" ")}
                                >
                                    {msg.text}
                                </div>
                            ) : null}

                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                                {/* 연락처 */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-bold text-neutral-700">이름 (필수)</label>
                                        <input
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="예) 홍길동"
                                            className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-neutral-700">연락처 (필수)</label>
                                        <input
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="예) 010-1234-5678"
                                            inputMode="tel"
                                            className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="text-xs font-bold text-neutral-700">이메일 (선택)</label>
                                    <input
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="예) example@email.com"
                                        inputMode="email"
                                        className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                    />
                                    <p className="mt-1 text-xs text-neutral-500">
                                        이메일은 선택입니다. 연락은 주로 전화/문자로 드려요.
                                    </p>
                                </div>

                                {/* 제목/내용 */}
                                <div className="mt-6">
                                    <label className="text-xs font-bold text-neutral-700">제목 (필수)</label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="제목"
                                        className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="text-xs font-bold text-neutral-700">문의 내용 (필수)</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="문의 내용을 입력하세요"
                                        className="mt-2 min-h-[220px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={!canSubmit}
                                    className={[
                                        "mt-5 rounded-xl px-6 py-3 text-sm font-extrabold text-white",
                                        canSubmit ? "bg-[#2E97F2] hover:brightness-95" : "bg-neutral-300 cursor-not-allowed",
                                    ].join(" ")}
                                >
                                    {saving ? "접수 중..." : "문의 접수"}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
