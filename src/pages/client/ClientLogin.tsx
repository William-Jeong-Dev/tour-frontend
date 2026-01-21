import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../../components/common/Container";
import { supabase } from "../../lib/supabase";

type Mode = "login" | "signup";

// ✅ 이메일 정규화 (공백/개행/유니코드 이슈 방지)
function normalizeEmail(input: string) {
    return input
        .normalize("NFKC")                  // 전각 -> 반각 (＠, ． 등)
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width 제거
        .replace(/\s+/g, "")                // 공백/줄바꿈 제거 (email에 공백이 있으면 무조건 컷)
        .toLowerCase()
        .trim();
}

export default function ClientLogin() {
    const nav = useNavigate();
    const location = useLocation();

    const redirectTo =
        (location.state as { redirectTo?: string } | null)?.redirectTo ?? "/";

    const [mode, setMode] = useState<Mode>("login");
    const title = useMemo(() => (mode === "login" ? "로그인" : "회원가입"), [mode]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 회원가입 시 바로 프로필에 넣을 최소 필드(나중에 MyPage에서 수정 가능)
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setInfo(null);
        setLoading(true);

        try {
            const emailN = normalizeEmail(email);

            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({ email: emailN, password });
                if (error) throw error;
                nav(redirectTo, { replace: true });
                return;
            }

            const { data, error } = await supabase.auth.signUp({ email: emailN, password });
            if (error) throw error;

            const uid = data.user?.id;
            if (uid) {
                await supabase.from("profiles").update({ name: name || null, phone: phone || null }).eq("user_id", uid);
            }

            setInfo("회원가입이 완료됐어요. 이메일 인증이 필요하면 메일함을 확인해 주세요.");
            nav(redirectTo, { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? `${title}에 실패했습니다.`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="bg-white">
            <Container>
                <div className="mx-auto max-w-md py-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold text-neutral-900">{title}</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                {mode === "login"
                                    ? "로그인 후 서비스를 이용할 수 있어요."
                                    : "회원가입 후 마이메뉴에서 프로필을 관리할 수 있어요."}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={[
                                    "inline-flex items-center justify-center",
                                    "whitespace-nowrap",          // ✅ 줄바꿈 금지
                                    "min-w-[72px] sm:min-w-[88px]", // ✅ 너무 좁아지지 않게
                                    "rounded-full",
                                    "px-3 py-2 sm:px-4 sm:py-2",   // ✅ 모바일에서도 터치 영역 확보
                                    "text-sm sm:text-xs font-extrabold", // ✅ 모바일 글자 살짝 키우기
                                    "leading-none",               // ✅ 높이 계산 안정화
                                    "transition",
                                    mode === "login"
                                        ? "bg-[#1C8B7B] text-white"
                                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                ].join(" ")}
                            >
                                로그인
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("signup")}
                                className={[
                                    "inline-flex items-center justify-center",
                                    "whitespace-nowrap",
                                    "min-w-[72px] sm:min-w-[88px]",
                                    "rounded-full",
                                    "px-3 py-2 sm:px-4 sm:py-2",
                                    "text-sm sm:text-xs font-extrabold",
                                    "leading-none",
                                    "transition",
                                    mode === "signup"
                                        ? "bg-[#1C8B7B] text-white"
                                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                ].join(" ")}
                            >
                                회원가입
                            </button>
                        </div>
                    </div>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-600">이메일</label>
                            <input
                                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-600">비밀번호</label>
                            <input
                                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                type="password"
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password"
                                minLength={6}
                            />
                            <div className="mt-2 text-[11px] text-neutral-400">최소 6자 이상</div>
                        </div>

                        {mode === "signup" ? (
                            <>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-600">이름(선택)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="홍길동"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-600">휴대폰(선택)</label>
                                    <input
                                        className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="010-1234-5678"
                                    />
                                </div>
                            </>
                        ) : null}

                        {err ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {err}
                            </div>
                        ) : null}

                        {info ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {info}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-[#1C8B7B] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                        >
                            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
                        </button>

                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                        >
                            뒤로가기
                        </button>
                    </form>
                </div>
            </Container>
        </main>
    );
}
