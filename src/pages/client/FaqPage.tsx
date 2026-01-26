import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";

export default function FaqPage() {
    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        <ServiceSideNav title="고객센터" />

                        <section className="col-span-12 md:col-span-9">
                            <h1 className="text-2xl font-extrabold text-neutral-900">자주묻는 질문</h1>
                            <p className="mt-2 text-sm text-neutral-500">준비 중입니다.</p>

                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                                <div className="text-sm font-extrabold">FAQ 페이지</div>
                                <div className="mt-2 text-sm text-neutral-600">
                                    여기에 “카테고리 / 검색 / 아코디언” 형태로 붙이면 돼.
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
