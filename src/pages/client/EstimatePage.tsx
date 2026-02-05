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
        return true;
    }, [form, callTime]);

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
                                        value={form.people_count}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                people_count: Number(e.target.value || 1),
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

                                            // ✅ email은 아예 안 보내거나(null로 고정) 중 택1
                                            const payload: EstimatePayload = {
                                                name: form.name.trim(),
                                                phone: form.phone.trim(),
                                                email: null, // ✅ Edge Function이 email 필드 자체를 기대하면 이게 제일 안전
                                                depart_date: form.depart_date,
                                                people_count: Number(form.people_count || 1),
                                                region: mergedRegion ? mergedRegion : null,
                                                budget: form.budget?.trim() ? form.budget.trim() : null,
                                                memo: mergedMemo ? mergedMemo : null,
                                            };

                                            await sendEstimateEmail(payload);

                                            alert("요청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.");
                                            navigate("/");

                                            setForm({
                                                name: "",
                                                phone: "",
                                                depart_date: "",
                                                people_count: 1,
                                                region: "",
                                                budget: "",
                                                memo: "",
                                            } as any);
                                            setCallTime("");
                                            setTravelRegions([]);
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
