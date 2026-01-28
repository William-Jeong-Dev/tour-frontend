import { useMemo, useState } from "react";
import Container from "../../components/common/Container";
import { HeroSlide, useHeroSlides, saveHeroSlides } from "../../hooks/useHeroSlides";
import { defaultHeroSlides } from "../client/HomeHeroDefaults";

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

type HeroCard = HeroSlide["cards"][number];

export default function HeroSlidesAdminPage() {
    const { slides, setSlides, loading } = useHeroSlides(defaultHeroSlides);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const canSave = useMemo(() => slides.length > 0, [slides.length]);

    const updateSlide = (index: number, patch: Partial<HeroSlide>) => {
        setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    };

    const moveSlide = (from: number, to: number) => {
        setSlides((prev) => {
            if (to < 0 || to >= prev.length) return prev;
            const next = [...prev];
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
                heroImage:
                    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80",
                cards: [
                    {
                        id: uid("card"),
                        title: "추천 상품 1",
                        price: "상담 문의",
                        img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                        badge: "추천",
                    },
                    {
                        id: uid("card"),
                        title: "추천 상품 2",
                        price: "상담 문의",
                        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
                        badge: "추천",
                    },
                ],
            },
        ]);
    };

    const deleteSlide = (index: number) => {
        setSlides((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCard = (slideIndex: number, cardIndex: number, patch: Partial<HeroCard>) => {
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
                            img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
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

    const onSave = async () => {
        setMsg(null);
        if (!canSave) return;

        for (const s of slides) {
            if (!s.title?.trim() || !s.heroImage?.trim()) {
                setMsg("슬라이드 제목/대표이미지는 필수입니다.");
                return;
            }
            if (!Array.isArray(s.cards) || s.cards.length === 0) {
                setMsg("각 슬라이드에 최소 1개의 카드를 넣어주세요.");
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

    return (
        <main className="bg-white">
            <Container>
                <div className="py-8 md:py-10 text-neutral-900">
                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">HERO 슬라이드 관리</h1>
                            <p className="mt-1 text-sm text-neutral-600">
                                홈 상단 HERO 영역의 슬라이드(제목/태그/이미지/카드)를 관리합니다.
                            </p>
                            {loading ? <p className="mt-1 text-xs text-neutral-500">불러오는 중…</p> : null}
                            {msg ? (
                                <p className="mt-2 text-sm font-semibold text-neutral-800">
                                    {msg}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={addSlide}
                                disabled={saving}
                                className="
                  inline-flex items-center gap-2 rounded-xl
                  border border-neutral-300 bg-white px-4 py-2
                  text-sm font-extrabold text-neutral-900
                  hover:bg-neutral-50
                  disabled:cursor-not-allowed disabled:opacity-60
                "
                            >
                                + 슬라이드 추가
                            </button>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving || !canSave}
                                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-neutral-900 px-4 py-2
                  text-sm font-extrabold text-white
                  hover:bg-neutral-800
                  disabled:cursor-not-allowed disabled:opacity-70
                "
                            >
                                {saving ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="mt-6 space-y-6">
                        {slides.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
                                아직 슬라이드가 없습니다.{" "}
                                <span className="font-semibold text-neutral-900">+ 슬라이드 추가</span>를 눌러 시작하세요.
                            </div>
                        ) : null}

                        {slides.map((s, idx) => (
                            <section key={s.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                                {/* Slide header row */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="text-lg font-extrabold text-neutral-900">슬라이드 {idx + 1}</div>
                                        <div className="mt-1 text-xs text-neutral-500">id: {s.id}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveSlide(idx, idx - 1)}
                                            disabled={idx === 0 || saving}
                                            className="
                        rounded-xl border border-neutral-300 bg-white px-3 py-2
                        text-sm font-extrabold text-neutral-900 hover:bg-neutral-50
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
                                            disabled={idx === slides.length - 1 || saving}
                                            className="
                        rounded-xl border border-neutral-300 bg-white px-3 py-2
                        text-sm font-extrabold text-neutral-900 hover:bg-neutral-50
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
                                            disabled={saving}
                                            className="
                        rounded-xl border border-red-200 bg-white px-3 py-2
                        text-sm font-extrabold text-red-600 hover:bg-red-50
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
                                            <label className="text-sm font-semibold text-neutral-700">제목 (줄바꿈은 \n)</label>
                                            <textarea
                                                value={s.title}
                                                onChange={(e) => updateSlide(idx, { title: e.target.value })}
                                                placeholder={"예)\n추운 겨울에도 따뜻하게,\n남국 겨울 골프 🎁 🏝️"}
                                                className="
                          mt-2 w-full min-h-[96px] rounded-xl
                          border border-neutral-300 bg-white px-3 py-2
                          text-sm text-neutral-900 placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-black/10
                        "
                                            />
                                            <p className="mt-1 text-xs text-neutral-600">
                                                실제 렌더링에서 <span className="font-semibold text-neutral-900">\\n</span> 기준으로 줄바꿈 처리됩니다.
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <label className="text-sm font-semibold text-neutral-700">태그</label>
                                            <input
                                                value={s.tags}
                                                onChange={(e) => updateSlide(idx, { tags: e.target.value })}
                                                placeholder="#겨울골프 #남국골프 #오키나와골프"
                                                className="
                          mt-2 w-full rounded-xl
                          border border-neutral-300 bg-white px-3 py-2
                          text-sm text-neutral-900 placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-black/10
                        "
                                            />
                                        </div>

                                        {/* Hero image */}
                                        <div>
                                            <label className="text-sm font-semibold text-neutral-700">오른쪽 대표 이미지 URL</label>
                                            <input
                                                value={s.heroImage}
                                                onChange={(e) => updateSlide(idx, { heroImage: e.target.value })}
                                                placeholder="https://images.unsplash.com/..."
                                                className="
                          mt-2 w-full rounded-xl
                          border border-neutral-300 bg-white px-3 py-2
                          text-sm text-neutral-900 placeholder:text-neutral-500
                          focus:outline-none focus:ring-2 focus:ring-black/10
                        "
                                            />
                                            <p className="mt-1 text-xs text-neutral-600">권장: 가로가 큰 이미지(예: 2400px 이상)</p>
                                        </div>

                                        {/* Cards */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-extrabold text-neutral-900">왼쪽 카드</div>
                                                    <div className="mt-1 text-xs text-neutral-600">1~2개를 추천합니다. (너무 많으면 UI가 복잡해져요)</div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => addCard(idx)}
                                                    disabled={saving}
                                                    className="
                            rounded-xl border border-neutral-300 bg-white px-3 py-2
                            text-sm font-extrabold text-neutral-900 hover:bg-neutral-50
                            disabled:cursor-not-allowed disabled:opacity-60
                          "
                                                >
                                                    + 카드 추가
                                                </button>
                                            </div>

                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                {s.cards.map((c, cardIdx) => (
                                                    <div key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <div className="text-sm font-extrabold text-neutral-900">카드 {cardIdx + 1}</div>
                                                                <div className="mt-1 text-xs text-neutral-500">id: {c.id}</div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteCard(idx, cardIdx)}
                                                                disabled={saving}
                                                                className="
                                  rounded-xl border border-red-200 bg-white px-3 py-2
                                  text-sm font-extrabold text-red-600 hover:bg-red-50
                                  disabled:cursor-not-allowed disabled:opacity-60
                                "
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        <div className="mt-4 space-y-3">
                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-700">제목</label>
                                                                <input
                                                                    value={c.title}
                                                                    onChange={(e) => updateCard(idx, cardIdx, { title: e.target.value })}
                                                                    placeholder="[얼리버드] 오키나와 실속 호텔+골프"
                                                                    className="
                                    mt-1 w-full rounded-xl
                                    border border-neutral-300 bg-white px-3 py-2
                                    text-sm text-neutral-900 placeholder:text-neutral-500
                                    focus:outline-none focus:ring-2 focus:ring-black/10
                                  "
                                                                />
                                                            </div>

                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                <div>
                                                                    <label className="text-xs font-semibold text-neutral-700">가격</label>
                                                                    <input
                                                                        value={c.price}
                                                                        onChange={(e) => updateCard(idx, cardIdx, { price: e.target.value })}
                                                                        placeholder="979,000원~"
                                                                        className="
                                      mt-1 w-full rounded-xl
                                      border border-neutral-300 bg-white px-3 py-2
                                      text-sm text-neutral-900 placeholder:text-neutral-500
                                      focus:outline-none focus:ring-2 focus:ring-black/10
                                    "
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs font-semibold text-neutral-700">뱃지</label>
                                                                    <input
                                                                        value={c.badge ?? ""}
                                                                        onChange={(e) => updateCard(idx, cardIdx, { badge: e.target.value })}
                                                                        placeholder="오키나와"
                                                                        className="
                                      mt-1 w-full rounded-xl
                                      border border-neutral-300 bg-white px-3 py-2
                                      text-sm text-neutral-900 placeholder:text-neutral-500
                                      focus:outline-none focus:ring-2 focus:ring-black/10
                                    "
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="text-xs font-semibold text-neutral-700">이미지 URL</label>
                                                                <input
                                                                    value={c.img}
                                                                    onChange={(e) => updateCard(idx, cardIdx, { img: e.target.value })}
                                                                    placeholder="https://images.unsplash.com/..."
                                                                    className="
                                    mt-1 w-full rounded-xl
                                    border border-neutral-300 bg-white px-3 py-2
                                    text-sm text-neutral-900 placeholder:text-neutral-500
                                    focus:outline-none focus:ring-2 focus:ring-black/10
                                  "
                                                                />
                                                            </div>

                                                            {/* Card preview image */}
                                                            <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200">
                                                                <div className="aspect-[16/9] w-full bg-neutral-100">
                                                                    {c.img ? (
                                                                        <img
                                                                            src={c.img}
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
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right preview */}
                                    <aside>
                                        <div className="text-sm font-extrabold text-neutral-800">미리보기</div>

                                        <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                                            <div className="aspect-[16/9] w-full bg-neutral-100">
                                                {s.heroImage ? (
                                                    <img
                                                        src={s.heroImage}
                                                        alt={s.title}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="p-4">
                                                <div className="text-sm font-extrabold text-neutral-900 whitespace-pre-line">{s.title}</div>
                                                <div className="mt-1 text-xs text-neutral-600">{s.tags}</div>
                                            </div>
                                        </div>

                                        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                                            <div className="text-xs font-semibold text-neutral-700">팁</div>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-600">
                                                <li>이미지가 안 보이면 URL이 올바른지 확인하세요.</li>
                                                <li>제목은 \\n으로 줄바꿈을 넣을 수 있어요.</li>
                                                <li>카드는 1~2개가 가장 보기 좋아요.</li>
                                            </ul>
                                        </div>
                                    </aside>
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </Container>
        </main>
    );
}
