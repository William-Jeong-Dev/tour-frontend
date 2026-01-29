import { useMemo, useState } from "react";
import Container from "../../components/common/Container";
import { HeroSlide, useHeroSlides, saveHeroSlides } from "../../hooks/useHeroSlides";
import { defaultHeroSlides } from "../client/HomeHeroDefaults";
import { getPublicSiteAssetUrl, uploadSiteAsset } from "../../api/siteSettings.api";

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

export default function HeroSlidesAdminPage() {
    const { slides, setSlides, loading } = useHeroSlides(defaultHeroSlides);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const canSave = useMemo(() => slides.length > 0, [slides.length]);

    const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
        setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    };

    const moveSlide = (from: number, to: number) => {
        setSlides((prev) => {
            const next = [...prev];
            if (to < 0 || to >= next.length) return next;
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    };

    const addSlide = () => {
        setSlides((prev) => [
            ...prev,
            {
                id: uid("slide"),
                title: "새 슬라이드 제목",
                tags: "#태그",
                heroImage: "", // ✅ 이제 URL 기본값 대신 업로드를 권장 (빈 값으로 시작)
                cards: [
                    {
                        id: uid("card"),
                        title: "추천 상품 1",
                        price: "상담 문의",
                        img: "",
                        badge: "추천",
                    },
                    {
                        id: uid("card"),
                        title: "추천 상품 2",
                        price: "상담 문의",
                        img: "",
                        badge: "추천",
                    },
                ],
            },
        ]);
    };

    const deleteSlide = (index: number) => {
        setSlides((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCard = (slideIndex: number, cardIndex: number, patch: any) => {
        setSlides((prev) =>
            prev.map((s, si) => {
                if (si !== slideIndex) return s;
                const cards = s.cards.map((c, ci) => (ci === cardIndex ? { ...c, ...patch } : c));
                return { ...s, cards };
            })
        );
    };

    const addCard = (slideIndex: number) => {
        setSlides((prev) =>
            prev.map((s, si) => {
                if (si !== slideIndex) return s;
                return {
                    ...s,
                    cards: [
                        ...s.cards,
                        {
                            id: uid("card"),
                            title: "새 카드",
                            price: "상담 문의",
                            img: "",
                            badge: "",
                        },
                    ],
                };
            })
        );
    };

    const deleteCard = (slideIndex: number, cardIndex: number) => {
        setSlides((prev) =>
            prev.map((s, si) => {
                if (si !== slideIndex) return s;
                return { ...s, cards: s.cards.filter((_, ci) => ci !== cardIndex) };
            })
        );
    };

    const uploadImage = async (file: File, dir: string): Promise<string | null> => {
        try {
            setMsg(null);
            setUploading(true);
            const path = await uploadSiteAsset(file, dir);
            return path;
        } catch (e: any) {
            setMsg(`업로드 실패: ${e?.message ?? String(e)}`);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const onSave = async () => {
        setMsg(null);
        if (!canSave) return;

        for (const s of slides) {
            if (!s.title.trim() || !s.heroImage.trim()) {
                setMsg("슬라이드 제목/대표이미지는 필수입니다.");
                return;
            }
        }

        setSaving(true);
        const { error } = await saveHeroSlides(slides);
        setSaving(false);

        if (error) {
            setMsg(`저장 실패: ${error.message}`);
            return;
        }
        setMsg("저장 완료 ✅ (홈 새로고침하면 반영됩니다)");
    };

    const disabled = saving || uploading;

    return (
        // ✅ AdminLayout이 이미 다크 배경이지만, 이 페이지 자체도 다크로 통일
        <main className="min-h-screen bg-neutral-950 text-neutral-100">
            <Container>
                <div className="py-8 md:py-10">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-100">HERO 슬라이드 관리</h1>
                            <p className="mt-1 text-sm text-neutral-400">
                                홈 상단 HERO 영역의 슬라이드(제목/태그/이미지/카드)를 관리합니다.
                            </p>
                            {msg ? (
                                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-200">
                                    {msg}
                                </div>
                            ) : null}
                            {uploading ? (
                                <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-3 text-sm text-neutral-300">
                                    이미지 업로드 중...
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={addSlide}
                                disabled={disabled}
                                className="
                  inline-flex items-center gap-2 rounded-xl
                  border border-neutral-800 bg-neutral-900/40 px-4 py-2
                  text-sm font-extrabold text-neutral-100
                  hover:bg-neutral-900
                  disabled:cursor-not-allowed disabled:opacity-60
                "
                            >
                                + 슬라이드 추가
                            </button>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={disabled}
                                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-white px-4 py-2
                  text-sm font-extrabold text-neutral-950
                  hover:bg-neutral-100
                  disabled:cursor-not-allowed disabled:opacity-70
                "
                            >
                                {saving ? "저장중..." : uploading ? "업로드중..." : "저장"}
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="mt-6 space-y-6">
                        {loading ? (
                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-300">
                                불러오는 중...
                            </div>
                        ) : null}

                        {slides.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 p-6 text-sm text-neutral-300">
                                아직 슬라이드가 없습니다. <span className="font-semibold text-white">+ 슬라이드 추가</span>를 눌러
                                시작하세요.
                            </div>
                        ) : null}

                        {slides.map((s, idx) => {
                            const heroUrl = getPublicSiteAssetUrl(s.heroImage);
                            return (
                                <section key={s.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 shadow-sm">
                                    {/* Slide header row */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="text-lg font-extrabold text-white">슬라이드 {idx + 1}</div>
                                            <div className="mt-1 text-xs text-neutral-400">id: {s.id}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => moveSlide(idx, idx - 1)}
                                                disabled={idx === 0 || disabled}
                                                className="
                          rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2
                          text-sm font-extrabold text-neutral-100 hover:bg-neutral-900
                          disabled:cursor-not-allowed disabled:opacity-50
                        "
                                                aria-label="위로"
                                                title="위로"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSlide(idx, idx + 1)}
                                                disabled={idx === slides.length - 1 || disabled}
                                                className="
                          rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2
                          text-sm font-extrabold text-neutral-100 hover:bg-neutral-900
                          disabled:cursor-not-allowed disabled:opacity-50
                        "
                                                aria-label="아래로"
                                                title="아래로"
                                            >
                                                ↓
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteSlide(idx)}
                                                disabled={disabled}
                                                className="
                          rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2
                          text-sm font-extrabold text-red-200 hover:bg-red-950/50
                          disabled:cursor-not-allowed disabled:opacity-60
                        "
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
                                        {/* Left form */}
                                        <div className="space-y-5">
                                            {/* Title */}
                                            <div>
                                                <label className="text-sm font-semibold text-neutral-200">제목 (줄바꿈은 \n)</label>
                                                <textarea
                                                    value={s.title}
                                                    onChange={(e) => updateSlide(idx, { title: e.target.value })}
                                                    placeholder={"예)\n추운 겨울에도 따뜻하게,\n남국 겨울 골프 🎁 🏝️"}
                                                    className="
                            mt-2 w-full min-h-[96px] rounded-xl
                            border border-neutral-800 bg-neutral-950 px-3 py-2
                            text-sm text-neutral-100 placeholder:text-neutral-500
                            focus:outline-none focus:ring-2 focus:ring-white/10
                          "
                                                />
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    실제 렌더링에서 <span className="font-semibold text-white">\\n</span> 기준으로 줄바꿈
                                                    처리됩니다.
                                                </p>
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <label className="text-sm font-semibold text-neutral-200">태그</label>
                                                <input
                                                    value={s.tags}
                                                    onChange={(e) => updateSlide(idx, { tags: e.target.value })}
                                                    placeholder="#겨울골프 #남국골프 #오키나와골프"
                                                    className="
                            mt-2 w-full rounded-xl
                            border border-neutral-800 bg-neutral-950 px-3 py-2
                            text-sm text-neutral-100 placeholder:text-neutral-500
                            focus:outline-none focus:ring-2 focus:ring-white/10
                          "
                                                />
                                            </div>

                                            {/* Hero image 업로드 */}
                                            <div>
                                                <label className="text-sm font-semibold text-neutral-200">오른쪽 대표 이미지 업로드</label>

                                                <div className="mt-2 flex flex-col gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={disabled}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            const path = await uploadImage(file, "hero");
                                                            if (!path) return;

                                                            updateSlide(idx, { heroImage: path });
                                                            e.currentTarget.value = "";
                                                        }}
                                                        className="
                              w-full rounded-xl
                              border border-neutral-800 bg-neutral-950 px-3 py-2
                              text-sm text-neutral-100
                              file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100
                              hover:file:bg-neutral-700
                              disabled:cursor-not-allowed disabled:opacity-60
                            "
                                                    />

                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="text-xs text-neutral-400 break-all">
                                                            현재: <span className="text-neutral-200">{s.heroImage ? s.heroImage : "(없음)"}</span>
                                                        </div>

                                                        {s.heroImage ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateSlide(idx, { heroImage: "" })}
                                                                disabled={disabled}
                                                                className="
                                  rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2
                                  text-xs font-extrabold text-neutral-100 hover:bg-neutral-900
                                  disabled:cursor-not-allowed disabled:opacity-60
                                "
                                                            >
                                                                제거
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    <p className="text-xs text-neutral-400">
                                                        업로드하면 <span className="font-semibold text-white">site-assets</span> 버킷에 저장됩니다.
                                                        (권장: 가로가 큰 이미지, 예: 2400px 이상)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Cards */}
                                            <div className="pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-extrabold text-white">왼쪽 카드</div>
                                                        <div className="mt-1 text-xs text-neutral-400">
                                                            1~2개를 추천합니다. (너무 많으면 UI가 복잡해져요)
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => addCard(idx)}
                                                        disabled={disabled}
                                                        className="
                              rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2
                              text-sm font-extrabold text-neutral-100 hover:bg-neutral-900
                              disabled:cursor-not-allowed disabled:opacity-60
                            "
                                                    >
                                                        + 카드 추가
                                                    </button>
                                                </div>

                                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                    {s.cards.map((c, cardIdx) => {
                                                        const cardUrl = getPublicSiteAssetUrl(c.img);
                                                        return (
                                                            <div
                                                                key={c.id}
                                                                className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <div className="text-sm font-extrabold text-white">카드 {cardIdx + 1}</div>
                                                                        <div className="mt-1 text-xs text-neutral-400">id: {c.id}</div>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteCard(idx, cardIdx)}
                                                                        disabled={disabled}
                                                                        className="
                                      rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2
                                      text-sm font-extrabold text-red-200 hover:bg-red-950/50
                                      disabled:cursor-not-allowed disabled:opacity-60
                                    "
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>

                                                                <div className="mt-4 space-y-3">
                                                                    <div>
                                                                        <label className="text-xs font-semibold text-neutral-200">제목</label>
                                                                        <input
                                                                            value={c.title}
                                                                            onChange={(e) => updateCard(idx, cardIdx, { title: e.target.value })}
                                                                            placeholder="[얼리버드] 오키나와 실속 호텔+골프"
                                                                            className="
                                        mt-1 w-full rounded-xl
                                        border border-neutral-800 bg-neutral-950 px-3 py-2
                                        text-sm text-neutral-100 placeholder:text-neutral-500
                                        focus:outline-none focus:ring-2 focus:ring-white/10
                                      "
                                                                        />
                                                                    </div>

                                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                                        <div>
                                                                            <label className="text-xs font-semibold text-neutral-200">가격</label>
                                                                            <input
                                                                                value={c.price}
                                                                                onChange={(e) => updateCard(idx, cardIdx, { price: e.target.value })}
                                                                                placeholder="979,000원~"
                                                                                className="
                                          mt-1 w-full rounded-xl
                                          border border-neutral-800 bg-neutral-950 px-3 py-2
                                          text-sm text-neutral-100 placeholder:text-neutral-500
                                          focus:outline-none focus:ring-2 focus:ring-white/10
                                        "
                                                                            />
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-xs font-semibold text-neutral-200">뱃지</label>
                                                                            <input
                                                                                value={c.badge ?? ""}
                                                                                onChange={(e) => updateCard(idx, cardIdx, { badge: e.target.value })}
                                                                                placeholder="오키나와"
                                                                                className="
                                          mt-1 w-full rounded-xl
                                          border border-neutral-800 bg-neutral-950 px-3 py-2
                                          text-sm text-neutral-100 placeholder:text-neutral-500
                                          focus:outline-none focus:ring-2 focus:ring-white/10
                                        "
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* ✅ 카드 이미지 업로드 */}
                                                                    <div>
                                                                        <label className="text-xs font-semibold text-neutral-200">이미지 업로드</label>

                                                                        <div className="mt-1 flex flex-col gap-2">
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                disabled={disabled}
                                                                                onChange={async (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file) return;

                                                                                    const path = await uploadImage(file, "hero/cards");
                                                                                    if (!path) return;

                                                                                    updateCard(idx, cardIdx, { img: path });
                                                                                    e.currentTarget.value = "";
                                                                                }}
                                                                                className="
                                          w-full rounded-xl
                                          border border-neutral-800 bg-neutral-950 px-3 py-2
                                          text-sm text-neutral-100
                                          file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100
                                          hover:file:bg-neutral-700
                                          disabled:cursor-not-allowed disabled:opacity-60
                                        "
                                                                            />

                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="text-xs text-neutral-400 break-all">
                                                                                    현재: <span className="text-neutral-200">{c.img ? c.img : "(없음)"}</span>
                                                                                </div>

                                                                                {c.img ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => updateCard(idx, cardIdx, { img: "" })}
                                                                                        disabled={disabled}
                                                                                        className="
                                              rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2
                                              text-xs font-extrabold text-neutral-100 hover:bg-neutral-900
                                              disabled:cursor-not-allowed disabled:opacity-60
                                            "
                                                                                    >
                                                                                        제거
                                                                                    </button>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Card preview image */}
                                                                    <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800">
                                                                        <div className="aspect-[16/9] w-full bg-neutral-900">
                                                                            {cardUrl ? (
                                                                                <img
                                                                                    src={cardUrl}
                                                                                    alt={c.title}
                                                                                    className="h-full w-full object-cover"
                                                                                    onError={(e) => {
                                                                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                                                                    }}
                                                                                />
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right preview */}
                                        <aside>
                                            <div className="text-sm font-extrabold text-neutral-200">미리보기</div>

                                            <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40 shadow-sm">
                                                <div className="aspect-[16/9] w-full bg-neutral-900">
                                                    {heroUrl ? (
                                                        <img
                                                            src={heroUrl}
                                                            alt={s.title}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="p-4">
                                                    <div className="text-sm font-extrabold text-white whitespace-pre-line">{s.title}</div>
                                                    <div className="mt-1 text-xs text-neutral-400">{s.tags}</div>
                                                </div>
                                            </div>

                                            <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                                                <div className="text-xs font-semibold text-neutral-200">팁</div>
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-400">
                                                    <li>이미지는 업로드 후 path로 저장됩니다. (예: hero/xxxx.png)</li>
                                                    <li>제목은 \\n으로 줄바꿈을 넣을 수 있어요.</li>
                                                    <li>카드는 1~2개가 가장 보기 좋아요.</li>
                                                </ul>
                                            </div>
                                        </aside>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </main>
    );
}