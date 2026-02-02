export default function Footer() {
    return (
        <footer id="site-footer" className="mt-14 sm:mt-16 bg-neutral-50">
            {/* 고객센터 바 */}
            <div id="cs" className="border-t border-b border-neutral-200">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-base font-semibold">
                            고객센터 <span className="ml-2 text-[#1C8B7B]">051-747-8207 , 010-8688-8810</span>
                        </div>
                        <div className="mt-1 text-sm text-neutral-500">
                            평일 09:00 ~ 18:00 · 업무시간 외 문의는 상담 채널로 남겨주세요.
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button className="w-full sm:w-auto rounded-lg bg-yellow-400 px-4 py-2 text-base font-bold text-neutral-900 hover:bg-yellow-300">
                            1:1 맞춤견적
                        </button>
                        <button className="w-full sm:w-auto rounded-lg border border-neutral-300 bg-white px-4 py-2 text-base font-semibold hover:bg-neutral-100">
                            FAQ/문의하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 링크 컬럼 */}
            <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 sm:px-6 py-10 md:grid-cols-5">
                <Col title="일본 골프" items={["아키나와", "가고시마", "후쿠오카/사가", "나가사키", "구마모토"]} />
                <Col title="겨울 골프" items={["오키나와 골프", "가고시마 골프", "미야자키 골프", "나가사키/구마모토"]} />
                <Col title="특가 골프" items={["얼리버드 특가", "급특가"]} />
                <Col title="서비스" items={["공지사항", "자주 묻는 질문", "기획전", "이벤트"]} />
                <Col title="1:1 견적문의" items={["견적문의"]} />
            </div>

            {/* 하단 정보 (2번째 이미지 스타일) */}
            <div className="border-t border-neutral-200">
                <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
                    <div className="text-sm text-neutral-500">
                        {/* 로고 */}
                        <img src="/card_thumbnail.svg" alt="TOUR" className="h-20 w-auto" />

                        {/* 링크 (bold) */}
                        <div className="mt-3 font-semibold text-neutral-700">
                            <a className="hover:text-neutral-900" href="/notices">공지사항</a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/terms">이용약관</a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/privacy">개인정보처리방침</a>
                            <span className="mx-2 text-neutral-300">|</span>
                            <a className="hover:text-neutral-900" href="/insurance">해외여행자보험</a>
                        </div>

                        {/* 사업자 정보: 지정한 줄 구성 */}
                        <div className="mt-5 space-y-1 leading-relaxed">
                            <div>
                                상호: 청원여행사 · 대표: 김동현 · 주소: 부산광역시 해운대구 해운대로 216 2층
                            </div>
                            <div>
                                대표번호: (051) 747-8207 · 이메일: chungwon87@naver.com · 팩스: (051) 747-82074 ·
                                사업자등록번호: 473-15-00667 · 통신판매업신고번호: 제2023-부산해운대-1696호
                            </div>
                            <div>관광사업자등록번호: 제2017-000026호</div>
                        </div>

                        {/* 하단 문구 */}
                        <div className="mt-6 space-y-1">
                            <div>Copyright @ 청원여행사 All Rights Reserved.</div>
                            <div>Powered by Findvalue Crop</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function Col({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <div className="text-base font-semibold text-neutral-800">{title}</div>
            <ul className="mt-3 space-y-2 text-base text-neutral-600">
                {items.map((x) => (
                    <li key={x}>
                        <a className="hover:text-neutral-900" href="#">
                            {x}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
