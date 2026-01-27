import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    useAdminUserBookings,
    useAdminUserFavorites,
    useAdminUserProfile,
} from "../../hooks/useAdminUsers";

function fmt(dt?: string | null) {
    if (!dt) return "-";
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminUserDetail() {
    const { id = "" } = useParams();
    const profileQ = useAdminUserProfile(id);
    const bookingsQ = useAdminUserBookings(id);
    const favsQ = useAdminUserFavorites(id);

    const [tab, setTab] = useState<"bookings" | "favorites">("bookings");

    const profile = profileQ.data;
    const bookings = useMemo(() => bookingsQ.data ?? [], [bookingsQ.data]);
    const favs = useMemo(() => favsQ.data ?? [], [favsQ.data]);

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-lg font-extrabold">회원 상세</div>
                    <div className="text-sm text-neutral-400">프로필/예약/찜 내역</div>
                </div>
                <Link to="/admin/users" className="text-sm text-neutral-200 hover:text-neutral-50">
                    ← 목록으로
                </Link>
            </div>

            <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                {profileQ.isLoading ? (
                    <div className="text-sm text-neutral-400">불러오는 중...</div>
                ) : profileQ.isError ? (
                    <div className="text-sm text-red-400">에러: {(profileQ.error as any)?.message ?? "unknown error"}</div>
                ) : !profile ? (
                    <div className="text-sm text-neutral-400">프로필이 없습니다.</div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                        <Info label="이메일" value={profile.email ?? "-"} />
                        <Info label="이름" value={profile.name ?? "-"} />
                        <Info label="전화" value={profile.phone ?? "-"} />
                        <Info label="생년월일" value={profile.birth_date ?? "-"} />
                        <Info label="국가" value={profile.country_code ?? "-"} />
                        <Info label="언어" value={profile.preferred_lang ?? "-"} />
                        <Info label="마케팅 동의" value={profile.marketing_opt_in ? "Y" : "N"} />
                        <Info label="가입일" value={fmt(profile.created_at)} />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                        tab === "bookings" ? "bg-neutral-50 text-neutral-950" : "bg-neutral-950/40 text-neutral-200 hover:bg-neutral-900"
                    }`}
                    onClick={() => setTab("bookings")}
                >
                    예약
                </button>
                <button
                    className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
                        tab === "favorites" ? "bg-neutral-50 text-neutral-950" : "bg-neutral-950/40 text-neutral-200 hover:bg-neutral-900"
                    }`}
                    onClick={() => setTab("favorites")}
                >
                    찜
                </button>
            </div>

            {tab === "bookings" ? (
                <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                    <div className="text-sm font-extrabold text-neutral-200">예약 목록 (최신 50)</div>
                    {bookingsQ.isLoading ? (
                        <div className="mt-3 text-sm text-neutral-400">불러오는 중...</div>
                    ) : bookingsQ.isError ? (
                        <div className="mt-3 text-sm text-red-400">에러: {(bookingsQ.error as any)?.message ?? "unknown error"}</div>
                    ) : bookings.length === 0 ? (
                        <div className="mt-3 text-sm text-neutral-400">예약이 없습니다.</div>
                    ) : (
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-[900px] w-full text-left text-sm">
                                <thead className="text-xs text-neutral-400">
                                <tr className="border-b border-neutral-900">
                                    <th className="py-2 pr-3">상품</th>
                                    <th className="py-2 pr-3">상태</th>
                                    <th className="py-2 pr-3">여행일</th>
                                    <th className="py-2 pr-3">인원</th>
                                    <th className="py-2 pr-3">연락처</th>
                                    <th className="py-2 pr-3">요청일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id} className="border-b border-neutral-900/70">
                                        <td className="py-3 pr-3 text-neutral-100">{b.product_title}</td>
                                        <td className="py-3 pr-3 text-neutral-200">{b.status}</td>
                                        <td className="py-3 pr-3 text-neutral-200">{b.travel_date ?? "-"}</td>
                                        <td className="py-3 pr-3 text-neutral-200">{b.people_count}</td>
                                        <td className="py-3 pr-3 text-neutral-200">
                                            {(b.contact_name ?? "-")} / {(b.contact_phone ?? "-")}
                                        </td>
                                        <td className="py-3 pr-3 text-neutral-300">{fmt(b.created_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4">
                    <div className="text-sm font-extrabold text-neutral-200">찜 목록 (최신 50)</div>
                    {favsQ.isLoading ? (
                        <div className="mt-3 text-sm text-neutral-400">불러오는 중...</div>
                    ) : favsQ.isError ? (
                        <div className="mt-3 text-sm text-red-400">에러: {(favsQ.error as any)?.message ?? "unknown error"}</div>
                    ) : favs.length === 0 ? (
                        <div className="mt-3 text-sm text-neutral-400">찜이 없습니다.</div>
                    ) : (
                        <div className="mt-3 overflow-x-auto">
                            <table className="min-w-[700px] w-full text-left text-sm">
                                <thead className="text-xs text-neutral-400">
                                <tr className="border-b border-neutral-900">
                                    <th className="py-2 pr-3">상품</th>
                                    <th className="py-2 pr-3">찜한 날짜</th>
                                </tr>
                                </thead>
                                <tbody>
                                {favs.map((f) => (
                                    <tr key={f.id} className="border-b border-neutral-900/70">
                                        <td className="py-3 pr-3 text-neutral-100">{f.product_title}</td>
                                        <td className="py-3 pr-3 text-neutral-300">{fmt(f.created_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-neutral-900 bg-neutral-950/40 p-3">
            <div className="text-xs font-semibold text-neutral-500">{label}</div>
            <div className="mt-1 font-extrabold text-neutral-100">{value}</div>
        </div>
    );
}