const COURSES = [
    { title: "오키나와 북부", sub: "키누차 C.C", img: "https://images.unsplash.com/photo-1523413450957-3ae7a6c5f2b0?auto=format&fit=crop&w=1400&q=60" },
    { title: "오키나와 중부", sub: "키세 C.C", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=60" },
    { title: "오키나와 시내", sub: "오키나와 C.C", img: "https://images.unsplash.com/photo-1502920917128-1aa500764b2c?auto=format&fit=crop&w=1400&q=60" },
    { title: "오키나와 시내", sub: "팜힐즈 G.C", img: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1400&q=60" },
];

export default function CourseSection() {
    return (
        <section className="py-12">
            <h3 className="text-2xl font-extrabold tracking-tight">
                오키나와 골프장 생성정보 ✍️
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {COURSES.map((c) => (
                    <div key={c.title + c.sub} className="group overflow-hidden rounded-2xl bg-neutral-100">
                        <div className="relative">
                            <img className="aspect-[4/3] w-full object-cover" src={c.img} alt="" />
                            <div className="absolute inset-0 bg-black/25" />
                            <div className="absolute left-4 top-4">
                                <div className="text-lg font-extrabold text-white drop-shadow">
                                    {c.title}
                                </div>
                                <div className="text-xl font-extrabold text-white drop-shadow">
                                    {c.sub}
                                </div>
                            </div>
                            <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs shadow">
                                ♡
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
