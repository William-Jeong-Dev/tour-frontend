import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../../components/common/Container";
import { useSession } from "../../hooks/useSession";
import { signOut, supabase } from "../../lib/supabase";

import { useQuery } from "@tanstack/react-query";
import { listMyFavorites, removeFavorite } from "../../api/favorites.api";
import { getMyBookings } from "../../api/bookings.api";

type Profile = {
    user_id: string;
    email: string | null;
    name: string | null;
    phone: string | null;
    birth_date: string | null; // yyyy-mm-dd
    marketing_opt_in: boolean;
    marketing_opt_in_at: string | null;
};

const BUCKET_NAME = "product-thumbnails";

export function useMyBookings(userId: string) {
    return useQuery({
        queryKey: ["bookings", "me"],
        queryFn: () => getMyBookings(userId),
        enabled: !!userId,
    });
}


export default function MyPage() {
    const { session, loading: sessionLoading } = useSession();

    const nav = useNavigate();
    const location = useLocation();

    const userId = session?.user?.id ?? null;

    const [profileLoading, setProfileLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [err, setErr] = useState<string | null>(null);

    // ✅ 찜 썸네일 signed url 저장소 (favorite row id -> signed url)
    const [thumbUrlMap, setThumbUrlMap] = useState<Record<string, string>>({});

    // ✅ 예약 썸네일 signed url 저장소 (booking id -> signed url)
    const [bookingThumbMap, setBookingThumbMap] = useState<Record<string, string>>({});

    // ✅ 내 예약 목록 쿼리
    const bookingQuery = useMyBookings(String(userId));

    const STATUS_LABEL: Record<string, string> = {
        REQUESTED: "접수",
        CONFIRMED: "확정",
        CANCELLED: "취소",
        COMPLETED: "완료",
    };

    const favQuery = useQuery({
        queryKey: ["myFavorites", userId],
        queryFn: () => listMyFavorites(String(userId)),
        enabled: !!userId,
    });

    // ✅ 로그인 안 하면 /login (세션 로딩 끝난 후)
    useEffect(() => {
        if (sessionLoading) return;
        if (!session) {
            nav("/login", { state: { redirectTo: location.pathname }, replace: true });
        }
    }, [sessionLoading, session, nav, location.pathname]);

    // ✅ 프로필 로드 (+ 없으면 자동 생성)
    useEffect(() => {
        const run = async () => {
            if (!session?.user?.id) return;

            setErr(null);
            setProfileLoading(true);

            const uid = session.user.id;

            const { data, error } = await supabase
                .from("profiles")
                .select("user_id,email,name,phone,birth_date,marketing_opt_in,marketing_opt_in_at")
                .eq("user_id", uid)
                .maybeSingle();

            if (error) {
                setErr(error.message);
                setProfile(null);
                setProfileLoading(false);
                return;
            }

            if (!data) {
                const email = session.user.email ?? null;

                const { data: created, error: insErr } = await supabase
                    .from("profiles")
                    .insert({
                        user_id: uid,
                        email,
                        name: null,
                        phone: null,
                        birth_date: null,
                        marketing_opt_in: false,
                        marketing_opt_in_at: null,
                    })
                    .select("user_id,email,name,phone,birth_date,marketing_opt_in,marketing_opt_in_at")
                    .single();

                if (insErr) {
                    setErr(insErr.message);
                    setProfile(null);
                } else {
                    setProfile(created as Profile);
                }

                setProfileLoading(false);
                return;
            }

            setProfile(data as Profile);
            setProfileLoading(false);
        };

        run();
    }, [session?.user?.id]);

    // ✅ 썸네일 path 정리 함수:
    // - DB에 "thumb/xxx.png"처럼 버킷 prefix가 섞여있어도 자동 제거
    const normalizeStoragePath = (raw: string) => {
        const p = String(raw ?? "").trim();
        if (!p) return "";

        // 1) 버킷 prefix 제거 (혹시 들어있으면)
        const prefix1 = `${BUCKET_NAME}/`;
        if (p.startsWith(prefix1)) return p.slice(prefix1.length);
        if (p.startsWith(`/${prefix1}`)) return p.slice(`/${prefix1}`.length);

        // 2) "thumb/" 같은 폴더 prefix 제거 (DB에 그렇게 저장된 경우)
        if (p.startsWith("thumb/")) return p.slice("thumb/".length);
        if (p.startsWith("/thumb/")) return p.slice("/thumb/".length);

        return p;
    };

    // ✅ favorites 로드되면 signed url 생성
    useEffect(() => {
        const run = async () => {
            const list = (favQuery.data ?? []) as any[];
            if (!list.length) return;

            const next: Record<string, string> = {};

            for (const f of list) {
                const rawPath = String(f.products?.thumbnail_path ?? f.products?.thumbnail_url ?? "").trim();

                if (!rawPath) continue;

                const { data, error } = await supabase.storage
                    .from("product-thumbnails")
                    .createSignedUrl(rawPath, 60 * 60);

                if (!error && data?.signedUrl) {
                    next[f.id] = data.signedUrl;
                }
            }

            setThumbUrlMap(next);
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favQuery.data]);

    useEffect(() => {
        const run = async () => {
            const list = (bookingQuery.data ?? []) as any[];
            if (!list.length) return;

            const next: Record<string, string> = {};

            for (const b of list) {
                const rawPath = String(b.products?.thumbnail_path ?? b.products?.thumbnail_url ?? "").trim();
                console.log("[booking] rawPath:", rawPath);

                if (!rawPath) continue;

                const { data, error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .createSignedUrl(rawPath, 60 * 60);

                if (error) {
                    console.log("[booking] signed url error:", error, rawPath);
                    continue;
                }

                if (data?.signedUrl) next[b.id] = data.signedUrl;
            }

            setBookingThumbMap(next);
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingQuery.data]);



    if (sessionLoading) return null;
    if (!session) return null;

    return (
        <main className="bg-white">
            <Container>
                <div className="py-10">
                    {/* 상단 헤더 */}
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold text-neutral-900">마이메뉴</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                {session.user.email ?? session.user.id}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                await signOut();
                                nav("/", { replace: true });
                            }}
                            className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                        >
                            로그아웃
                        </button>
                    </div>

                    {/* 내 프로필 */}
                    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
                        <div className="text-base font-extrabold text-neutral-900">내 프로필</div>

                        {profileLoading ? (
                            <div className="mt-4 text-sm text-neutral-500">불러오는 중...</div>
                        ) : err ? (
                            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {err}
                            </div>
                        ) : !profile ? (
                            <div className="mt-4 text-sm text-neutral-500">프로필을 불러오지 못했어요.</div>
                        ) : (
                            <form
                                className="mt-5 space-y-4"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!profile) return;

                                    setSaving(true);
                                    setErr(null);

                                    const uid = session.user.id;
                                    const nextMarketingAt = profile.marketing_opt_in ? new Date().toISOString() : null;

                                    const { error } = await supabase
                                        .from("profiles")
                                        .update({
                                            name: profile.name,
                                            phone: profile.phone,
                                            birth_date: profile.birth_date,
                                            marketing_opt_in: profile.marketing_opt_in,
                                            marketing_opt_in_at: nextMarketingAt,
                                        })
                                        .eq("user_id", uid);

                                    if (error) {
                                        setErr(error.message);
                                    } else {
                                        setProfile({ ...profile, marketing_opt_in_at: nextMarketingAt });
                                    }

                                    setSaving(false);
                                }}
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-600">이름</label>
                                        <input
                                            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                            value={profile.name ?? ""}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            placeholder="홍길동"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-neutral-600">휴대폰</label>
                                        <input
                                            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                            value={profile.phone ?? ""}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="010-1234-5678"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-neutral-600">생년월일</label>
                                        <input
                                            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                                            type="date"
                                            value={profile.birth_date ?? ""}
                                            onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={!!profile.marketing_opt_in}
                                                onChange={(e) => setProfile({ ...profile, marketing_opt_in: e.target.checked })}
                                            />
                                            <span className="text-sm font-semibold text-neutral-800">마케팅 수신 동의</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-2xl bg-[#1C8B7B] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                                    >
                                        {saving ? "저장 중..." : "저장하기"}
                                    </button>

                                    {profile.marketing_opt_in_at ? (
                                        <div className="mt-3 text-xs text-neutral-500">
                                            동의 시각: {new Date(profile.marketing_opt_in_at).toLocaleString()}
                                        </div>
                                    ) : null}
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 내 예약 현황 */}
                    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
                        <div className="text-base font-extrabold text-neutral-900">내 예약 현황</div>

                        {bookingQuery.isLoading ? (
                            <div className="mt-4 text-sm text-neutral-500">불러오는 중...</div>
                        ) : bookingQuery.isError ? (
                            <div className="mt-4 text-sm text-rose-700">
                                {(bookingQuery.error as any)?.message ?? "예약 목록을 불러오지 못했어요."}
                            </div>
                        ) : (bookingQuery.data ?? []).length === 0 ? (
                            <div className="mt-4 text-sm text-neutral-500">예약 내역이 없어요.</div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {(bookingQuery.data ?? []).map((b: any) => {
                                    const p = b.products;
                                    const title = p?.title ?? "(상품 정보 없음)";
                                    const region = p?.region ?? "";
                                    const thumb = bookingThumbMap[b.id] || "";
                                    const status = STATUS_LABEL[b.status] ?? b.status;

                                    return (
                                        <Link
                                            key={b.id}
                                            to={`/product/${p?.id ?? b.product_id}`}
                                            className="flex gap-4 rounded-2xl border border-neutral-200 p-4 hover:bg-neutral-50"
                                        >
                                            <div className="h-16 w-24 overflow-hidden rounded-xl bg-neutral-100">
                                                {thumb ? (
                                                    <img
                                                        src={thumb}
                                                        alt={title}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full grid place-items-center text-[11px] font-bold text-neutral-400">
                                                        NO IMAGE
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-extrabold text-neutral-900 line-clamp-1">{title}</div>
                                                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-extrabold text-neutral-700">
                                                            {status}
                                                    </span>
                                                </div>

                                                <div className="mt-1 text-xs text-neutral-500">
                                                    {region}
                                                    {b.people_count ? ` · 인원 ${b.people_count}명` : ""}
                                                    {b.travel_date ? ` · 희망일 ${b.travel_date}` : ""}
                                                </div>

                                                <div className="mt-1 text-[11px] text-neutral-400">
                                                    접수 시각: {b.created_at ? new Date(b.created_at).toLocaleString() : "-"}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 내 찜 목록 */}
                    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
                        <div className="text-base font-extrabold text-neutral-900">내 찜 목록</div>

                        {favQuery.isLoading ? (
                            <div className="mt-4 text-sm text-neutral-500">불러오는 중...</div>
                        ) : favQuery.isError ? (
                            <div className="mt-4 text-sm text-rose-700">
                                {(favQuery.error as any)?.message ?? "찜 목록을 불러오지 못했어요."}
                            </div>
                        ) : (favQuery.data ?? []).length === 0 ? (
                            <div className="mt-4 text-sm text-neutral-500">아직 찜한 상품이 없어요.</div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {(favQuery.data ?? []).map((f: any) => {
                                    const title = f.products?.title ?? "(상품 정보 없음)";
                                    const region = f.products?.region ?? "";
                                    const priceText = f.products?.price_text ?? "상담 문의";

                                    // ✅ 우선순위:
                                    // 1) DB에 thumbnail_url(완전 URL)이 있으면 그걸 사용
                                    // 2) 없으면 signed url(map) 사용
                                    const thumb = thumbUrlMap[f.id] || "";

                                    return (
                                        <Link
                                            key={f.id}
                                            to={`/product/${f.product_id}`}
                                            className="flex gap-4 rounded-2xl border border-neutral-200 p-4 hover:bg-neutral-50"
                                        >
                                            <div className="h-16 w-24 overflow-hidden rounded-xl bg-neutral-100">
                                                {thumb ? (
                                                    <img
                                                        src={thumb}
                                                        alt={title}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full grid place-items-center text-[11px] font-bold text-neutral-400">
                                                        NO IMAGE
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-extrabold text-neutral-900 line-clamp-1">{title}</div>
                                                <div className="mt-1 text-xs text-neutral-500">
                                                    {region} · {priceText}
                                                </div>
                                                <div className="mt-1 text-[11px] text-neutral-400">
                                                    찜한 시각(KST): {f.created_at_kst ?? "-"}
                                                </div>

                                                {/* ✅ 디버깅용: path 확인하고 싶으면 주석 해제 */}
                                                {/* <div className="mt-1 text-[10px] text-neutral-300">
                          path: {String(f.products?.thumbnail_path ?? "-")}
                        </div> */}
                                            </div>

                                            <button
                                                type="button"
                                                className="shrink-0 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    await removeFavorite(String(f.product_id), String(userId));
                                                    await favQuery.refetch();
                                                }}
                                            >
                                                찜 해제
                                            </button>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </main>
    );
}
