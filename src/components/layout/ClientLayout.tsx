import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "../common/FloatingActions";
import ScrollToTop from "../common/ScrollToTop";

export default function ClientLayout() {
    return (
        <div className="min-h-dvh bg-white text-neutral-900">
            <div id="page-top" />
            <ScrollToTop />
            <Header />
            <main>
                <div id="top-sentinel" className="h-px w-full" />
                <Outlet />
            </main>
            <FloatingActions />
            <Footer />
        </div>
    );
}
