import type { PropsWithChildren } from "react";

export default function HScroll({
                                    children,
                                    className = "",
                                }: PropsWithChildren<{ className?: string }>) {
    return (
        <div className={`px-4 ${className}`}>
            <div className="-mx-4 overflow-x-auto">
                <div className="flex gap-4 px-4 pb-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
