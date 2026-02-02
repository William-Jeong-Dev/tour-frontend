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

    // ✅ 추가: 통화 가능 시간
    const [callTime, setCallTime] = useState("");

    const [form, setForm] = useState<EstimatePayload>({
        name: "",
        phone: "",
        email: "",
        depart_date: "",
        people_count: 1,
        region: "",
        budget: "",
        memo: "",
    });

    const canSubmit = useMemo(() => {
        if (!form.name.trim()) return false;
        if (!form.phone.trim()) return false;
        if (!form.depart_date.trim()) return false;
        if (!form.people_count || form.people_count < 1) return false;
        // 통화 가능 시간은 "필수"로 보이니 여기서 체크
        if (!callTime.trim()) return false;
        return true;
    }, [form, callTime]);

    const toggleRegion = (value: string) => {
        setForm((prev) => {
            const current = prev.region
                ? prev.region.split(",").map((v) => v.trim()).filter(Boolean)
                : [];

            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];

            return { ...prev, region: next.join(", ") };
        });
    };

    const selectedRegions = useMemo(() => {
        return form.region
            ? form.region.split(",").map((v) => v.trim()).filter(Boolean)
            : [];
    }, [form.region]);

    return (
        <main className="bg-white">
            <Container>
                <div className="pt-8 pb-16">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="text-2xl font-extrabold text-neutral-900">1:1 맞춤견적</h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            원하시는 일정/조건을 남겨주시면 담당자가 확인 후 연락드립니다.
                        </p>

                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* 이름 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">이름 (필수)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 홍길동"
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    />
                                </div>

                                {/* 연락처 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">연락처 (필수)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 010-1234-5678"
                                        value={form.phone}
                                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                    />
                                </div>

                                {/* 이메일 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">이메일 (선택)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) example@email.com"
                                        value={form.email ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    />
                                    <div className="mt-2 text-xs text-neutral-400">
                                        이메일은 선택입니다. 연락은 주로 전화/문자로 드려요.
                                    </div>
                                </div>

                                {/* 출발일 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">출발일 (필수)</label>
                                    <input
                                        type="date"
                                        min={todayISO()}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={form.depart_date}
                                        onChange={(e) => setForm((p) => ({ ...p, depart_date: e.target.value }))}
                                    />
                                </div>

                                {/* 인원 */}
                                <div>
                                    <label className="text-sm font-bold text-neutral-800">인원 (필수)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={form.people_count}
                                        onChange={(e) =>
                                            setForm((p) => ({ ...p, people_count: Number(e.target.value || 1) }))
                                        }
                                    />
                                </div>

                                {/* ✅ 2. 원하는 여행지(복수선택) */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">
                                        2. 원하는 여행지 (복수 선택)
                                    </label>

                                    <div className="mt-3 space-y-2">
                                        {REGION_OPTIONS.map((opt) => {
                                            const checked = selectedRegions.includes(opt);
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
                                                        onChange={() => toggleRegion(opt)}
                                                        className="h-4 w-4 accent-blue-500"
                                                    />
                                                    {opt}
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-2 text-xs text-neutral-400">
                                        복수 선택 가능해요. 아래 입력칸에 지역/테마를 더 자유롭게 적어도 됩니다.
                                    </div>
                                </div>

                                {/* 지역/테마 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">희망 지역/테마 (선택)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 오키나와 / 가고시마 / 온천골프"
                                        value={form.region ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                                    />
                                </div>

                                {/* ✅ 통화 가능 시간 (필수) */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">통화 가능 시간 (필수)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 오후 6시 이후 / 아무때나"
                                        value={callTime}
                                        onChange={(e) => setCallTime(e.target.value)}
                                    />
                                </div>

                                {/* 예산 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">예산 (선택)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 1인 100만원대 / 총 400만원"
                                        value={form.budget ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                                    />
                                </div>

                                {/* 요청사항 */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-neutral-800">요청사항 (선택)</label>
                                    <textarea
                                        rows={8}
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        placeholder="예) 골프장/호텔 등급, 항공 포함 여부, 출발지, 라운딩 횟수, 온천 포함 여부 등"
                                        value={form.memo ?? ""}
                                        onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
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
                                            alert("필수 항목(이름/연락처/출발일/인원/통화가능시간)을 입력해 주세요.");
                                            return;
                                        }

                                        try {
                                            setSubmitting(true);

                                            // ✅ memo에 통화 가능 시간을 합쳐서 보냄 (서버/Edge Function 수정 없이도 전달됨)
                                            const mergedMemo = [
                                                callTime.trim() ? `통화 가능 시간: ${callTime.trim()}` : null,
                                                form.memo?.trim() ? form.memo.trim() : null,
                                            ]
                                                .filter(Boolean)
                                                .join("\n\n");

                                            const payload: EstimatePayload = {
                                                name: form.name.trim(),
                                                phone: form.phone.trim(),
                                                email: form.email?.trim() ? form.email.trim() : null,
                                                depart_date: form.depart_date,
                                                people_count: Number(form.people_count || 1),
                                                region: form.region?.trim() ? form.region.trim() : null,
                                                budget: form.budget?.trim() ? form.budget.trim() : null,
                                                memo: mergedMemo ? mergedMemo : null,
                                            };

                                            await sendEstimateEmail(payload);

                                            alert("요청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.");
                                            navigate("/");

                                            setForm({
                                                name: "",
                                                phone: "",
                                                email: "",
                                                depart_date: "",
                                                people_count: 1,
                                                region: "",
                                                budget: "",
                                                memo: "",
                                            });
                                            setCallTime("");
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
