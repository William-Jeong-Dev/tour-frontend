import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../../components/common/Container";
import ServiceSideNav from "../../components/common/ServiceSideNav";

const DEMO_DETAIL: Record<string, { title: string; created_at: string; content: string }> = {
    "1": { title: "5월 신용카드 무이자 할부 안내", created_at: "2024-12-04", content: "무이자 할부 안내 내용(데모)\n\n- 카드사별 정책은 변동될 수 있습니다." },
    "2": { title: "지안투어 골프투어 서비스 지역 안내", created_at: "2024-10-31", content: "서비스 지역 안내 내용(데모)" },
    "3": { title: "지안투어 가을 예약 이벤트 🍁", created_at: "2024-10-24", content: "이벤트 안내 내용(데모)" },
    "4": { title: "지안투어 비즈니스 골프투어 1:1 컨시어지 서비스", created_at: "2024-10-24", content: "컨시어지 서비스 안내(데모)" },
    "5": { title: "Q. 골프여행 예약 과정은 어떻게 되나요?", created_at: "2024-10-24", content: "예약 과정 안내(데모)" },
};

export default function NoticeDetailPage() {
    const { id } = useParams();

    const data = useMemo(() => {
        if (!id) return null;
        return DEMO_DETAIL[id] ?? { title: "공지 상세(데모)", created_at: "-", content: "내용이 없습니다." };
    }, [id]);

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    <div className="grid grid-cols-12 gap-8">
                        <ServiceSideNav title="공지사항" />

                        <section className="col-span-12 md:col-span-9">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-neutral-500">공지사항</div>
                                    <h1 className="mt-2 text-2xl font-extrabold text-neutral-900">{data?.title}</h1>
                                    <div className="mt-2 text-xs text-neutral-500">{data?.created_at}</div>
                                </div>

                                <Link
                                    to="/notices"
                                    className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                >
                                    목록으로
                                </Link>
                            </div>

                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                                <pre className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">{data?.content}</pre>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    );
}
