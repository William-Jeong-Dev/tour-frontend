import { useState } from "react";
import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";

export default function SupportPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const onSubmit = () => {
        // TODO: supabase insert 연결
        alert("문의가 접수되었습니다(데모).");
        setTitle("");
        setContent("");
    };

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        <ServiceSideNav title="공지사항" />

                        <section className="col-span-12 md:col-span-9">
                            <h1 className="text-2xl font-extrabold text-neutral-900">문의하기</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                문의 내용을 남겨주시면 빠르게 답변 드릴게요.
                            </p>

                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="제목"
                                    className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                                />

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="문의 내용을 입력하세요"
                                    className="mt-4 min-h-[220px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                />

                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    className="mt-5 rounded-xl bg-[#1C8B7B] px-6 py-3 text-sm font-extrabold text-white hover:brightness-95"
                                >
                                    문의 접수
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
