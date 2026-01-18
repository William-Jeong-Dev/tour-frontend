import { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
    return <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">{children}</div>;
}
