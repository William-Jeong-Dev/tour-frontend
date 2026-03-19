import Container from "../../components/common/Container";
import { Link } from "react-router-dom";

export default function TermsPage() {
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
                    <h1 className="text-3xl font-extrabold text-neutral-900">이용약관</h1>
                    <div className="mt-2 text-sm text-neutral-500">
                        청원여행사 여행상품 이용약관입니다.
                    </div>

                    {/* 내용 */}
                    <div className="mt-8 space-y-8">
                        {/* 여행계약 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">여행계약</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    1. 여행계약은 여행자가 여행업자에게 여행의 예약을 하고 여행업자가 이를 승낙함으로써 성립합니다.
                                </p>
                                <p>
                                    2. 여행업자는 여행자에게 여행 일정, 여행사업자의 등록번호·상호·소재지 및 관광진흥법에 의한 영업보증보험 등의 가입에 관한 사항 등 여행계약서와 약관 및 여행조건 설명서를 교부하여야 합니다.
                                </p>
                                <p>
                                    3. 여행업자는 여행출발 전 여행자에게 여행일정표와 여행약관을 서면 또는 전자문서로 교부하여야 합니다.
                                </p>
                            </div>
                        </section>

                        {/* 예약금 및 잔금 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">예약금 및 잔금</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    1. 예약금: 여행요금의 10% 이상 (상품에 따라 상이)
                                </p>
                                <p>
                                    2. 잔금: 여행 출발 7일 전까지 완납
                                    <br />
                                    ※ 성수기 및 연휴기간 상품의 경우 잔금 납부일이 상이할 수 있습니다.
                                </p>
                                <p>
                                    3. 예약금 입금 후 예약이 확정되며, 잔금 미납 시 예약이 취소될 수 있습니다.
                                </p>
                            </div>
                        </section>

                        {/* 취소/환불 규정 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">취소/환불 규정</h2>
                            <div className="mt-4">
                                <p className="text-sm leading-7 text-neutral-700">
                                    여행자의 여행계약 해제 요청이 있는 경우, 여행업자는 아래 기준에 따라 취소료를 공제 후 환불합니다.
                                </p>

                                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-neutral-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold text-neutral-700">취소 시점</th>
                                                <th className="px-4 py-3 text-left font-bold text-neutral-700">환불 기준</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200">
                                            <tr>
                                                <td className="px-4 py-3 text-neutral-600">출발 21일~15일전</td>
                                                <td className="px-4 py-3 text-neutral-600">총액 10%</td>
                                            </tr>
                                            <tr className="bg-neutral-50">
                                                <td className="px-4 py-3 text-neutral-600">출발 14일~8일전</td>
                                                <td className="px-4 py-3 text-neutral-600">총액 30%</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-neutral-600">출발 7일~4일전</td>
                                                <td className="px-4 py-3 text-neutral-600">총액 50%</td>
                                            </tr>
                                            <tr className="bg-neutral-50">
                                                <td className="px-4 py-3 text-neutral-600">출발 3일전~당일</td>
                                                <td className="px-4 py-3 text-neutral-600">총액 100%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 rounded-lg bg-amber-50 p-4">
                                    <p className="text-xs leading-5 text-amber-800">
                                        ※ 현지사정에 의해 추가 캔슬챠지가 발생할수 있습니다.
                                        <br />
                                        ※ 천재지변을 제외한 개인사정 또는 우천 시 캔슬의 경우 그린피 환불은 불가합니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 여행자 의무사항 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">여행자 의무사항</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    1. 여행자는 여행 출발 전까지 여권, 비자 등 여행에 필요한 서류를 구비해야 합니다.
                                </p>
                                <p>
                                    2. 여행자는 여행 중 여행업자의 안내에 따라야 하며, 여행 일정을 임의로 변경하여서는 안됩니다.
                                </p>
                                <p>
                                    3. 여행자의 귀책사유로 인하여 발생한 추가 비용은 여행자가 부담합니다.
                                </p>
                                <p>
                                    4. 여행자는 여행 중 타인에게 피해를 주는 행위를 하여서는 안됩니다.
                                </p>
                            </div>
                        </section>

                        {/* 여행사 책임 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">여행사 책임</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    1. 여행업자는 여행 출발 시부터 도착 시까지 여행자의 안전에 대하여 주의를 기울여야 합니다.
                                </p>
                                <p>
                                    2. 여행업자는 여행자에게 안전에 관한 정보를 제공하여야 합니다.
                                </p>
                                <p>
                                    3. 여행업자는 고의 또는 과실로 여행자에게 손해를 가한 경우 손해를 배상할 책임이 있습니다.
                                </p>
                                <p>
                                    4. 천재지변, 전쟁, 정부의 명령, 운송·숙박기관의 파업 등 불가항력적인 사유로 인하여 여행일정이 변경되거나 여행이 불가능해진 경우에는 책임을 지지 않습니다.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
