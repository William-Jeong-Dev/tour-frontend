import Container from "../../components/common/Container";
import { Link } from "react-router-dom";

export default function InsurancePage() {
    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    {/* 뒤로가기 버튼 */}
                    <div className="mb-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                        >
                            ← 홈으로
                        </Link>
                    </div>

                    {/* 페이지 타이틀 */}
                    <h1 className="text-3xl font-extrabold text-neutral-900">해외여행자보험</h1>
                    <div className="mt-2 text-sm text-neutral-500">
                        안전한 여행을 위한 해외여행자보험 안내입니다.
                    </div>

                    {/* 내용 */}
                    <div className="mt-8 space-y-8">
                        {/* 보험 가입 안내 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">해외여행자보험 가입 안내</h2>
                            <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
                                <p>
                                    해외여행 중 발생할 수 있는 다양한 위험으로부터 고객님을 보호하기 위해 해외여행자보험 가입을 적극 권장드립니다.
                                </p>
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="font-semibold text-blue-900">중요 안내</p>
                                    <p className="mt-2 text-blue-800">
                                        해외여행자보험은 여행상품 가격에 포함되어 있지 않으며, 별도로 가입하셔야 합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 보험 보장 내용 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">주요 보장 내용</h2>
                            <div className="mt-4">
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">상해사망 및 후유장해</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            해외여행 중 발생한 상해로 인한 사망 및 후유장해 시 보험금 지급
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">질병사망</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            해외여행 중 발생한 질병으로 인한 사망 시 보험금 지급
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">상해·질병 치료비</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            해외여행 중 상해 또는 질병으로 인한 치료비 실손 보상
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">배상책임</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            타인의 신체나 재물에 손해를 입혀 법률상 배상책임을 지게 된 경우 보상
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">휴대품 손해</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            여행 중 휴대품의 도난, 파손 등으로 인한 손해 보상
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 p-4">
                                        <h3 className="font-bold text-neutral-900">항공기 지연 및 수하물 지연</h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            항공기 지연 및 수하물 지연으로 인한 추가 비용 보상
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 가입 방법 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">가입 방법</h2>
                            <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
                                <div>
                                    <h3 className="font-semibold text-neutral-900">1. 온라인 가입</h3>
                                    <p className="mt-2">
                                        각 보험사 홈페이지 또는 비교 사이트를 통해 간편하게 가입하실 수 있습니다.
                                    </p>
                                    <ul className="mt-2 ml-4 space-y-1 text-neutral-600">
                                        <li>• 삼성화재 해외여행보험</li>
                                        <li>• DB손해보험 해외여행보험</li>
                                        <li>• 현대해상 해외여행보험</li>
                                        <li>• KB손해보험 해외여행보험</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-neutral-900">2. 여행사를 통한 가입</h3>
                                    <p className="mt-2">
                                        청원여행사 고객센터로 문의하시면 보험 가입을 도와드립니다.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-neutral-900">3. 공항에서 가입</h3>
                                    <p className="mt-2">
                                        출국 당일 공항에 있는 보험사 창구에서도 가입 가능합니다.
                                    </p>
                                </div>

                                <div className="rounded-lg bg-amber-50 p-4">
                                    <p className="font-semibold text-amber-900">권장사항</p>
                                    <p className="mt-2 text-amber-800">
                                        여행 출발 최소 1일 전까지 가입하시는 것을 권장드리며, 출발 당일 공항에서 가입 시 보장 개시 시점이 달라질 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 보험료 안내 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">보험료 안내</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    보험료는 여행 기간, 여행지, 나이, 보장 내용에 따라 달라집니다.
                                </p>
                                <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                                    <h3 className="font-semibold text-neutral-900">예시 (참고용)</h3>
                                    <ul className="mt-2 space-y-2">
                                        <li>
                                            <span className="font-medium">일본 3박 4일 여행:</span>
                                            <span className="ml-2 text-neutral-600">약 10,000원 ~ 30,000원</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">유럽 7박 8일 여행:</span>
                                            <span className="ml-2 text-neutral-600">약 30,000원 ~ 80,000원</span>
                                        </li>
                                    </ul>
                                    <p className="mt-3 text-xs text-neutral-500">
                                        ※ 위 금액은 참고용이며, 실제 보험료는 보험사 및 선택한 플랜에 따라 차이가 있을 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 유의사항 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">유의사항</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <ul className="ml-4 space-y-2">
                                    <li>
                                        • 해외여행자보험은 출발 전 가입하셔야 하며, 여행 중 가입은 불가능합니다.
                                    </li>
                                    <li>
                                        • 기존 질병이나 임신 관련 사항은 보장에서 제외될 수 있으니, 약관을 반드시 확인하시기 바랍니다.
                                    </li>
                                    <li>
                                        • 위험한 스포츠 활동(스카이다이빙, 번지점프 등)은 특약 가입이 필요할 수 있습니다.
                                    </li>
                                    <li>
                                        • 보험금 청구 시 현지 병원 진료비 영수증, 진단서 등의 서류가 필요합니다.
                                    </li>
                                    <li>
                                        • 보험 가입 후 약관 및 가입 증명서를 반드시 출력하거나 저장하여 휴대하시기 바랍니다.
                                    </li>
                                </ul>

                                <div className="mt-6 rounded-lg bg-rose-50 p-4">
                                    <p className="font-semibold text-rose-900">중요</p>
                                    <p className="mt-2 text-rose-800">
                                        신용카드 부가 서비스로 제공되는 해외여행자보험은 보장 범위가 제한적일 수 있으므로, 별도의 보험 가입을 권장드립니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 문의 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">문의</h2>
                            <div className="mt-4 text-sm leading-7 text-neutral-700">
                                <p>
                                    해외여행자보험 관련 문의사항이 있으시면 청원여행사 고객센터로 연락주시기 바랍니다.
                                </p>
                                <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                                    <div className="space-y-2">
                                        <div className="font-semibold">고객센터</div>
                                        <div className="text-neutral-600">전화: 고객센터 페이지 참조</div>
                                        <div className="text-neutral-600">운영시간: 평일 09:00 ~ 18:00</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
