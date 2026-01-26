import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isAdmin } from "../../lib/supabase";

export default function AdminLogin() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return email.trim().length > 0 && password.length > 0 && !loading;
    }, [email, password, loading]);

    useEffect(() => {
        // 이미 로그인 + 관리자면 바로 /admin/products로
        (async () => {
            const ok = await isAdmin();
            if (ok) nav("/admin/products", { replace: true });
        })();
    }, [nav]);

    const signIn = async () => {
        setErr(null);

        const e = email.trim();
        const p = password;

        if (!e || !p) {
            setErr("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: e,
                password: p,
            });
            if (error) throw error;

            // ✅ 로그인 성공 후 “관리자 화이트리스트” 확인
            const ok = await isAdmin();
            if (!ok) {
                await supabase.auth.signOut();
                setErr("관리자 권한이 없습니다. admin_users에 등록된 계정인지 확인하세요.");
                return;
            }

            nav("/admin/products", { replace: true });
        } catch (e: any) {
            // Supabase 에러 메시지 그대로 보여주면 영어가 나올 수 있어서 부드럽게 처리
            const msg = String(e?.message ?? "");
            if (msg.toLowerCase().includes("invalid login credentials")) {
                setErr("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else {
                setErr(e?.message ?? "로그인에 실패했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] bg-white">
            {/* soft background */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#2E97F2]/10 blur-2xl" />
                    <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-sky-200/40 blur-2xl" />
                    <div className="absolute left-1/3 top-56 h-72 w-72 rounded-full bg-emerald-200/30 blur-2xl" />
                </div>

                <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-14 lg:grid-cols-2 lg:py-20">
                    {/* Left: brand/benefits */}
                    <div className="flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2E97F2] text-white shadow-sm">
                                A
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-neutral-600">TOUR Admin</div>
                                <div className="text-lg font-extrabold tracking-tight text-neutral-900">
                                    상품 관리 콘솔
                                </div>
                            </div>
                        </div>

                        <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900">
                            안전하게 로그인하고
                            <br />
                            상품을 관리하세요.
                        </h1>

                        <p className="mt-4 text-sm leading-6 text-neutral-600">
                            이 페이지는 관리자 전용입니다. 로그인 후에도{" "}
                            <span className="font-semibold text-neutral-900">admin_users</span>에 등록되지 않았다면
                            접근이 차단됩니다.
                        </p>

                        <div className="mt-6 grid gap-3">
                            <InfoRow title="최근 수정순 기본 정렬" desc="상품 리스트는 updatedAt 기준으로 자동 정렬됩니다." />
                            <InfoRow title="서버 없이 운영" desc="Supabase + Vercel 구성으로 비용을 최소화합니다." />
                            <InfoRow title="권한은 단순하게" desc="관리자 여부만 체크(권한 세분화 없음)로 유지합니다." />
                        </div>
                    </div>

                    {/* Right: login card */}
                    <div className="lg:pl-8">
                        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xl font-extrabold text-neutral-900">관리자 로그인</div>
                                    <div className="mt-2 text-sm text-neutral-500">
                                        이메일/비밀번호로 로그인합니다.
                                    </div>
                                </div>
                                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-700">
                                    Supabase Auth
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                <Field label="이메일">
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@email.com"
                                        autoComplete="email"
                                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#2E97F2] focus:ring-4 focus:ring-[#2E97F2]/10"
                                    />
                                </Field>

                                <Field label="비밀번호">
                                    <div className="relative">
                                        <input
                                            type={showPw ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition focus:border-[#2E97F2] focus:ring-4 focus:ring-[#2E97F2]/10"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") signIn();
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                                        >
                                            {showPw ? "숨김" : "보기"}
                                        </button>
                                    </div>
                                </Field>

                                {err ? (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                        <div className="font-bold">로그인 실패</div>
                                        <div className="mt-1 leading-6">{err}</div>
                                    </div>
                                ) : null}

                                <button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={signIn}
                                    className="w-full rounded-2xl bg-[#2E97F2] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "로그인 중..." : "로그인"}
                                </button>

                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-600">
                                    <div className="font-bold text-neutral-800">접속이 막힐 때 체크</div>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        <li>Auth Users에 계정이 생성되어 있는지</li>
                                        <li>admin_users에 해당 user_id(UUID)가 등록되어 있는지</li>
                                        <li>products write 정책이 is_admin()로 설정되어 있는지</li>
                                    </ul>
                                </div>

                                <div className="pt-1 text-center text-xs text-neutral-400">
                                    © {new Date().getFullYear()} Tour Admin
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-xs text-neutral-500">
                            운영 전에는 반드시 RLS/정책을 점검하세요.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-2 text-sm font-semibold text-neutral-700">{label}</div>
            {children}
        </div>
    );
}

function InfoRow({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-sm">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#2E97F2]/10 text-[#2E97F2]">
                ✓
            </div>
            <div className="min-w-0">
                <div className="text-sm font-extrabold text-neutral-900">{title}</div>
                <div className="mt-1 text-sm leading-6 text-neutral-600">{desc}</div>
            </div>
        </div>
    );
}
