const ITEMS = [
    "일본 골프장 생성정보",
    "일본 골프장 랭킹",
    "DIY 골프",
    "서비스지역",
    "컨시어지 서비스",
    "일본골프클럽",
    "자주 묻는 질문",
    "채팅상담",
    "문의하기",
    "제안/정보등록",
];

export default function IconMenuSection() {
    return (
        <section className="py-10">
            <div className="grid grid-cols-3 gap-6 md:grid-cols-5 lg:grid-cols-10">
                {ITEMS.map((t) => (
                    <button
                        key={t}
                        className="flex flex-col items-center gap-3 text-center text-xs text-neutral-600 hover:text-neutral-900"
                    >
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-neutral-200 bg-white text-xl">
                            ⛳
                        </div>
                        <div className="leading-snug">{t}</div>
                    </button>
                ))}
            </div>
        </section>
    );
}
