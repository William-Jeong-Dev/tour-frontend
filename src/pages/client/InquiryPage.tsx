import { useState } from "react";

export default function InquiryPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const onSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해 주세요.");
            return;
        }
        alert("문의가 접수되었어요. (임시)");
        setTitle("");
        setContent("");
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="text-lg font-extrabold text-neutral-900">문의하기</div>
            <p className="mt-2 text-sm text-neutral-500">문의 내용을 남겨주시면 빠르게 답변드릴게요.</p>

            <div className="mt-6 space-y-3">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                    placeholder="제목"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                    rows={10}
                    placeholder="문의 내용을 입력하세요"
                />

                <button
                    type="button"
                    className="rounded-xl bg-[#1C8B7B] px-5 py-3 text-sm font-extrabold text-white hover:brightness-95"
                    onClick={onSubmit}
                >
                    문의 접수
                </button>
            </div>
        </div>
    );
}