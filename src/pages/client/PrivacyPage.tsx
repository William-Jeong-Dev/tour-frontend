import Container from "../../components/common/Container";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-extrabold text-neutral-900">개인정보처리방침</h1>
                    <div className="mt-2 text-sm text-neutral-500">
                        청원여행사는 고객님의 개인정보를 소중히 다루고 있습니다.
                    </div>

                    {/* 내용 */}
                    <div className="mt-8 space-y-8">
                        {/* 개인정보 수집 및 이용 목적 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보 수집 및 이용 목적</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    청원여행사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                                </p>
                                <ul className="ml-4 space-y-2">
                                    <li>• 여행상품 예약 및 서비스 제공</li>
                                    <li>• 고객 상담 및 불만 처리</li>
                                    <li>• 마케팅 및 광고에 활용</li>
                                    <li>• 이벤트 및 프로모션 안내</li>
                                </ul>
                            </div>
                        </section>

                        {/* 수집하는 개인정보의 항목 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">수집하는 개인정보의 항목</h2>
                            <div className="mt-4 text-sm leading-7 text-neutral-700">
                                <p className="mb-4">청원여행사는 다음의 개인정보 항목을 수집하고 있습니다.</p>

                                <div className="rounded-lg bg-neutral-50 p-4">
                                    <h3 className="font-bold text-neutral-900">필수 항목</h3>
                                    <ul className="mt-2 ml-4 space-y-1">
                                        <li>• 성명, 생년월일, 성별</li>
                                        <li>• 휴대전화번호, 이메일</li>
                                        <li>• 여권정보 (여권번호, 여권만료일)</li>
                                        <li>• 결제정보 (카드번호, 계좌번호 등)</li>
                                    </ul>
                                </div>

                                <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                                    <h3 className="font-bold text-neutral-900">선택 항목</h3>
                                    <ul className="mt-2 ml-4 space-y-1">
                                        <li>• 주소, 직업</li>
                                        <li>• 기념일 정보</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 개인정보의 보유 및 이용기간 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보의 보유 및 이용기간</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                                </p>

                                <div className="rounded-lg bg-neutral-50 p-4">
                                    <h3 className="mb-3 font-bold text-neutral-900">보유기간</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <span className="font-semibold">여행 서비스 제공:</span> 서비스 제공 완료 후 5년
                                            <span className="ml-2 text-xs text-neutral-500">(전자상거래법)</span>
                                        </li>
                                        <li>
                                            <span className="font-semibold">계약 또는 청약철회 기록:</span> 5년
                                            <span className="ml-2 text-xs text-neutral-500">(전자상거래법)</span>
                                        </li>
                                        <li>
                                            <span className="font-semibold">대금결제 및 재화 공급 기록:</span> 5년
                                            <span className="ml-2 text-xs text-neutral-500">(전자상거래법)</span>
                                        </li>
                                        <li>
                                            <span className="font-semibold">소비자 불만 또는 분쟁처리 기록:</span> 3년
                                            <span className="ml-2 text-xs text-neutral-500">(전자상거래법)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 개인정보의 제3자 제공 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보의 제3자 제공</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                                </p>
                                <p>
                                    여행상품 제공을 위해 필요한 경우 항공사, 호텔, 현지 여행사 등에 개인정보를 제공할 수 있으며, 이 경우 사전에 고객님께 고지하고 동의를 받습니다.
                                </p>
                            </div>
                        </section>

                        {/* 개인정보 처리의 위탁 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보 처리의 위탁</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 외부 전문업체에 위탁하여 운영하고 있습니다.
                                </p>
                                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-neutral-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold text-neutral-700">수탁업체</th>
                                                <th className="px-4 py-3 text-left font-bold text-neutral-700">위탁업무 내용</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200">
                                            <tr>
                                                <td className="px-4 py-3 text-neutral-600">결제 대행사</td>
                                                <td className="px-4 py-3 text-neutral-600">신용카드 결제 처리</td>
                                            </tr>
                                            <tr className="bg-neutral-50">
                                                <td className="px-4 py-3 text-neutral-600">SMS/Email 발송업체</td>
                                                <td className="px-4 py-3 text-neutral-600">예약 확인 및 안내 발송</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 정보주체의 권리·의무 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">정보주체의 권리·의무 및 행사방법</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                                </p>
                                <ul className="ml-4 space-y-2">
                                    <li>1. 개인정보 열람 요구</li>
                                    <li>2. 오류 등이 있을 경우 정정 요구</li>
                                    <li>3. 삭제 요구</li>
                                    <li>4. 처리정지 요구</li>
                                </ul>
                                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm font-semibold text-blue-900">권리 행사 방법</p>
                                    <p className="mt-2 text-sm text-blue-800">
                                        고객센터(전화, 이메일 등)를 통하여 요청하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 개인정보의 파기 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보의 파기</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
                                </p>
                                <div className="mt-4">
                                    <p className="font-semibold">파기 절차</p>
                                    <p className="mt-1">
                                        이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">파기 방법</p>
                                    <ul className="mt-1 ml-4 space-y-1">
                                        <li>• 전자적 파일 형태: 복구 및 재생되지 않도록 기술적 방법을 이용하여 완전하게 삭제</li>
                                        <li>• 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 개인정보 보호책임자 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보 보호책임자</h2>
                            <div className="mt-4 text-sm leading-7 text-neutral-700">
                                <p className="mb-4">
                                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                                </p>
                                <div className="rounded-lg bg-neutral-50 p-4">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold">개인정보 보호책임자</span>
                                        </div>
                                        <div>성명: 청원여행사 개인정보 관리자</div>
                                        <div>연락처: 고객센터 문의</div>
                                        <div>이메일: 고객센터 문의</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 개인정보 처리방침 변경 */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-neutral-900">개인정보 처리방침 변경</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
                                <p>
                                    이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                                </p>
                                <div className="rounded-lg bg-neutral-50 p-4">
                                    <p className="font-semibold">공고일자: 2024년 1월 1일</p>
                                    <p className="mt-1">시행일자: 2024년 1월 1일</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
