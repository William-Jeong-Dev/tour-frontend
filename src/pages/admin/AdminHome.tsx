import { Link } from "react-router-dom";

export default function AdminHome() {
    return (
        <div>
            <div className="text-xl font-semibold">대시보드</div>
            <div className="mt-2 text-sm text-neutral-300">
                상품을 등록/수정/삭제하고, 추후 주문/고객/문의 관리로 확장할 수 있습니다.
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Link
                    to="/admin/products"
                    className="rounded-3xl border border-neutral-900 bg-neutral-900/20 p-5 hover:bg-neutral-900/30"
                >
                    <div className="text-sm font-semibold">상품 관리</div>
                    <div className="mt-2 text-sm text-neutral-300">상품 목록 / 등록 / 수정 / 삭제</div>
                </Link>
            </div>
        </div>
    );
}
