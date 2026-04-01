import { useMemo, useState } from "react";
import Container from "../../components/common/Container";
import { sendEstimateEmail, type EstimatePayload } from "../../api/estimate.api";
import { useNavigate } from "react-router-dom";

function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

const REGION_OPTIONS = ["일본", "중국", "베트남", "기타"];

export default function EstimatePage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    // ✅ 통화 가능 시간
    const [callTime, setCallTime] = useState("");

    // ✅ 원하는 여행지(복수선택)
    const [travelRegions, setTravelRegions] = useState<string[]>([]);

    // ✅ 개인정보 및 마케팅 동의
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);

    // ✅ email 제거
    const [form, setForm] = useState<
        Omit<EstimatePayload, "email">
    >({
        name: "",
        phone: "",
        depart_date: "",
        return_date: "",
        people_count: 1,
        region: "",
        budget: "",
        memo: "",
    } as any);

    const canSubmit = useMemo(() => {
        if (!form.name.trim()) return false;
        if (!form.phone.trim()) return false;
        if (!form.depart_date.trim()) return false;
        if (!form.return_date?.trim()) return false;
        if (!form.people_count || form.people_count < 1) return false;
        if (!callTime.trim()) return false;
        if (!privacyAgreed) return false;
        return true;
    }, [form, callTime, privacyAgreed]);

    const toggleTravelRegion = (value: string) => {
        setTravelRegions((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    return (
        <main className="bg-white">
            <Container>
                <div className="pt-8 pb-16">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="text-2xl font-extrabold text-neutral-900">
                            1:1 맞춤견적
                        </h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            원하시는 일정/조건을 남겨주시면 담당자가 확인 후 연락드립니다.
                        </p>

                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* 이름 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">
                                        이름 (필수)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 홍길동"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, name: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 연락처 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">
                                        연락처 (필수)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 010-1234-5678"
                                        value={form.phone}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, phone: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 출발일 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">
                                        출발일 (필수)
                                    </label>
                                    <input
                                        type="date"
                                        min={todayISO()}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={form.depart_date}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, depart_date: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 리턴일 */}
                                <div>
                                    <label className="text-sm font-semibold">리턴일 (필수)</label>
                                    <input
                                        type="date"
                                        min={form.depart_date || undefined}
                                        value={form.return_date || ""}
                                        onChange={(e) => setForm((prev) => ({ ...prev, return_date: e.target.value }))}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-300 focus:ring-0"
                                    />
                                </div>

                                {/* 인원 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">
                                        인원 (필수)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={form.people_count || ""}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                people_count: parseInt(e.target.value, 10) || 0,
                                            }))
                                        }
                                    />
                                </div>

                                {/* 원하는 여행지(복수선택) */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        2. 원하는 여행지 (복수 선택)
                                    </label>

                                    <div className="mt-3 space-y-2">
                                        {REGION_OPTIONS.map((opt) => {
                                            const checked = travelRegions.includes(opt);
                                            return (
                                                <label
                                                    key={opt}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm
                          ${
                                                        checked
                                                            ? "border-blue-400 bg-blue-50"
                                                            : "border-neutral-200 hover:border-neutral-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleTravelRegion(opt)}
                                                        className="h-4 w-4 accent-blue-500"
                                                    />
                                                    {opt}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 희망 지역/테마 (선택) */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        희망 지역/테마 (선택)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 오키나와 / 가고시마 / 온천골프"
                                        value={form.region ?? ""}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, region: e.target.value }))
                                        }
                                    />
                                    <div className="mt-2 text-xs text-neutral-400">
                                        위 ‘원하는 여행지’ 선택과 무관하게 자유롭게 적어주세요.
                                    </div>
                                </div>

                                {/* 예산 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        예산 (선택)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 1인 100만원대 / 총 400만원"
                                        value={form.budget ?? ""}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, budget: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 통화 가능 시간 (필수) */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        통화 가능 시간 (필수)
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 오후 6시 이후 / 아무때나"
                                        value={callTime}
                                        onChange={(e) => setCallTime(e.target.value)}
                                    />
                                </div>

                                {/* 요청사항 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        요청사항 (선택)
                                    </label>
                                    <textarea
                                        rows={8}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 골프장/호텔 등급, 항공 포함 여부, 출발지, 라운딩 횟수, 온천 포함 여부 등"
                                        value={form.memo ?? ""}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, memo: e.target.value }))
                                        }
                                    />
                                </div>

                                {/* 개인정보 수집 및 이용 동의 (필수) */}
                                <div className="md:col-span-2 mt-4">
                                    <div className="rounded-xl border border-neutral-200 p-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={privacyAgreed}
                                                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                                className="mt-1 h-4 w-4 accent-blue-500"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-bold text-neutral-800">
                                                    개인정보 수집 및 이용 동의 (필수)
                                                </span>
                                            </div>
                                        </label>
                                        <div className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 leading-relaxed">
                                            <p className="font-semibold mb-2">청원여행사는 1:1 맞춤 견적 문의 및 여행 상담을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>

                                            <p className="font-semibold mt-3">1. 수집 항목</p>
                                            <p>- 필수 항목: 이름, 휴대전화번호, 이메일, 여행 일정 정보(출발일, 리턴일 등)</p>
                                            <p>- 선택 항목: 예산, 통화 가능 시간, 요청사항</p>

                                            <p className="font-semibold mt-3">2. 수집 및 이용 목적</p>
                                            <p>- 맞춤 여행 상담 및 견적 제공</p>
                                            <p>- 여행 일정 안내 및 예약 진행 관리</p>
                                            <p>- 고객 문의 응대 및 민원 처리</p>

                                            <p className="font-semibold mt-3">3. 보유 및 이용 기간</p>
                                            <p>- 상담 및 여행 진행 종료 후 즉시 파기</p>
                                            <p>- 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관</p>

                                            <p className="mt-3 text-neutral-500">※ 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 필수 항목에 대한 동의를 거부할 경우 1:1 맞춤 견적 문의 접수가 제한될 수 있습니다.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 마케팅 정보 수신 동의 (선택) */}
                                <div className="md:col-span-2">
                                    <div className="rounded-xl border border-neutral-200 p-4">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={marketingAgreed}
                                                onChange={(e) => setMarketingAgreed(e.target.checked)}
                                                className="mt-1 h-4 w-4 accent-blue-500"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-bold text-neutral-800">
                                                    마케팅 정보 수신 동의 (선택)
                                                </span>
                                            </div>
                                        </label>
                                        <div className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 leading-relaxed">
                                            <p className="font-semibold mb-2">청원여행사는 신규 여행 상품, 프로모션, 이벤트 및 할인 정보 등을 문자(SMS), 카카오톡, 이메일 등을 통해 안내드릴 수 있습니다.</p>

                                            <p className="font-semibold mt-3">1. 수집 항목</p>
                                            <p>- 이름, 휴대전화번호, 이메일</p>

                                            <p className="font-semibold mt-3">2. 이용 목적</p>
                                            <p>- 신규 여행 상품 안내</p>
                                            <p>- 이벤트 및 프로모션 정보 제공</p>
                                            <p>- 맞춤형 여행 상품 추천</p>

                                            <p className="font-semibold mt-3">3. 보유 및 이용 기간</p>
                                            <p>- 동의 철회 시까지</p>

                                            <p className="mt-3 text-neutral-500">※ 귀하는 마케팅 정보 수신에 대한 동의를 거부할 권리가 있으며, 동의를 거부하셔도 1:1 맞춤 견적 문의 및 상담 서비스 이용에는 제한이 없습니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    disabled={!canSubmit || submitting}
                                    className="rounded-2xl bg-[#2E97F2] px-6 py-3 text-sm font-extrabold text-white hover:brightness-95 disabled:opacity-60"
                                    onClick={async () => {
                                        if (!canSubmit) {
                                            alert(
                                                "필수 항목(이름/연락처/출발일/인원/통화가능시간)을 입력해 주세요."
                                            );
                                            return;
                                        }

                                        try {
                                            setSubmitting(true);

                                            // (1) 통화 가능 시간은 memo에 합침
                                            const mergedMemo = [
                                                callTime.trim()
                                                    ? `통화 가능 시간: ${callTime.trim()}`
                                                    : null,
                                                form.memo?.trim() ? form.memo.trim() : null,
                                            ]
                                                .filter(Boolean)
                                                .join("\n\n");

                                            // (2) region은 합쳐서 보냄
                                            const mergedRegion = [
                                                travelRegions.length
                                                    ? `원하는 여행지: ${travelRegions.join(", ")}`
                                                    : null,
                                                form.region?.trim()
                                                    ? `희망 지역/테마: ${form.region.trim()}`
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(" / ");

                                            const payload: EstimatePayload = {
                                                name: form.name.trim(),
                                                phone: form.phone.trim(),
                                                email: null,
                                                depart_date: form.depart_date,
                                                return_date: form.return_date || null,
                                                people_count: Number(form.people_count || 1),
                                                region: mergedRegion ? mergedRegion : null,
                                                budget: form.budget?.trim() ? form.budget.trim() : null,
                                                memo: mergedMemo ? mergedMemo : null,
                                                privacy_agreed: privacyAgreed,
                                                marketing_agreed: marketingAgreed,
                                                travel_regions: travelRegions.length ? travelRegions.join(", ") : "미입력",
                                                call_time: callTime.trim() || "미입력",
                                            };

                                            await sendEstimateEmail(payload);

                                            alert("요청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.");
                                            navigate("/");

                                            setForm({
                                                name: "",
                                                phone: "",
                                                depart_date: "",
                                                return_date: "",
                                                people_count: 1,
                                                region: "",
                                                budget: "",
                                                memo: "",
                                            } as any);
                                            setCallTime("");
                                            setTravelRegions([]);
                                            setPrivacyAgreed(false);
                                            setMarketingAgreed(false);
                                        } catch (e: any) {
                                            alert(e?.message ?? "요청 접수에 실패했습니다.");
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                >
                                    {submitting ? "전송 중..." : "요청하기"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
