import { Link } from "react-router-dom";
import type { CardItem } from "./mock";

export default function ProductCard({ item }: { item: CardItem }) {
    return (
        <Link to={`/product/${item.id}`} className="group">
            <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
                <div className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-xs shadow">
                    ♡
                </div>

                <img
                    src={item.image}
                    alt=""
                    className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                />

                {/* 이미지 위 라벨 */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                        <span
                            key={t}
                            className="rounded-md bg-[#2E97F2] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
                        >
              {t}
            </span>
                    ))}
                </div>
            </div>

            <div className="mt-3">
                <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
                    {item.subtitle}
                </div>
                <div className="mt-1 line-clamp-1 text-sm text-neutral-600">{item.title}</div>
                <div className="mt-2 text-sm font-extrabold text-neutral-900">{item.price}</div>
            </div>
        </Link>
    );
}
