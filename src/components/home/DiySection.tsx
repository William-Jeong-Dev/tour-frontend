import ProductCard from "./ProductCard";
import { cards } from "./mock";

export default function DiySection() {
    return (
        <section className="py-12">
            <h3 className="text-2xl font-extrabold tracking-tight">
                필요한 것만 예약하자 ✍️ 내맘대로 DIY
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((p) => (
                    <ProductCard key={`diy-${p.id}`} item={{ ...p, price: "10,000원~" }} />
                ))}
            </div>
        </section>
    );
}
