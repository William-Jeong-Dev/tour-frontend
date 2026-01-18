import { Outlet } from "react-router-dom";
import AdminSideNav from "./AdminSideNav";

export default function AdminLayout() {
    return (
        <div className="min-h-dvh bg-neutral-950 text-neutral-50">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px,1fr]">
                <AdminSideNav />
                <div className="rounded-3xl border border-neutral-900 bg-neutral-900/20 p-5">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
