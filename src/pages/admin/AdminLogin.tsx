import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/auth.api";
import { authStore } from "../../store/auth.store";

export default function AdminLogin() {
    const nav = useNavigate();
    const setToken = authStore((s) => s.setToken);
    const [email, setEmail] = useState("admin@tour.com");
    const [password, setPassword] = useState("admin1234");
    const [err, setErr] = useState<string | null>(null);

    return (
        <div className="min-h-dvh bg-neutral-950 text-neutral-50 grid place-items-center px-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-900 bg-neutral-900/20 p-6">
                <div className="text-xl font-semibold">Admin Login</div>
                <div className="mt-2 text-sm text-neutral-300">상품/콘텐츠 관리를 위한 로그인</div>

                <div className="mt-6 space-y-3">
                    <input
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                    />
                    <input
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="password"
                    />
                    {err && <div className="text-sm text-red-300">{err}</div>}
                    <button
                        onClick={async () => {
                            try {
                                setErr(null);
                                const { token } = await adminLogin({ email, password });
                                setToken(token);
                                nav("/admin");
                            } catch (e: any) {
                                setErr(e?.message ?? "로그인 실패");
                            }
                        }}
                        className="w-full rounded-xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-950"
                    >
                        로그인
                    </button>

                    <div className="text-xs text-neutral-500">
                        (Mock) 계정: admin@tour.com / admin1234
                    </div>
                </div>
            </div>
        </div>
    );
}
