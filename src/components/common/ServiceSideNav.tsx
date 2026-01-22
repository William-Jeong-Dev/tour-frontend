import { NavLink } from "react-router-dom";

function cx(...arr: Array<string | false | null | undefined>) {
    return arr.filter(Boolean).join(" ");
}

const itemBase =
    "mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition border border-transparent text-neutral-700 hover:bg-neutral-50";

const itemActive =
    "mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-extrabold transition border border-emerald-200 bg-emerald-50 text-emerald-800";

export default function ServiceSideNav({ title = "공지사항" }: { title?: string }) {
    return (
        <aside className="col-span-12 md:col-span-3">
            <div className="rounded-2xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-4">
                    <div className="text-sm font-extrabold text-neutral-900">{title}</div>
                </div>

                <div className="p-2">
                    <NavLink to="/notices" className={({ isActive }) => (isActive ? itemActive : itemBase)}>
                        공지사항
                    </NavLink>

                    <NavLink to="/faq" className={({ isActive }) => (isActive ? itemActive : itemBase)}>
                        자주묻는질문
                    </NavLink>

                    <NavLink to="/support" className={({ isActive }) => (isActive ? itemActive : itemBase)}>
                        문의하기
                    </NavLink>
                </div>
            </div>
        </aside>
    );
}
