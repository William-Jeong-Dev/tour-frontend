import { useAdminProductsFilter } from "../../hooks/useAdminProducts";

const CATS = ["전체", "일본", "제주", "동남아", "유럽"];

export default function CategoryChips() {
    const { region, setRegion } = useAdminProductsFilter(); // 필터 상태 공유(홈/어드민 공용)

    return (
        <div className="flex flex-wrap gap-2">
            {CATS.map((t) => (
                <button
                    key={t}
                    onClick={() => setRegion(t)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                        region === t
                            ? "border-neutral-50 bg-neutral-50 text-neutral-950"
                            : "border-neutral-800 text-neutral-200 hover:bg-neutral-900"
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>
    );
}
