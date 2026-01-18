import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import KakaoFloating from "../common/KakaoFloating";
import ScrollTopFloating from "../common/ScrollTopFloating";
import ScrollToTop from "../common/ScrollToTop";

export default function ClientLayout() {
    return (
        <div className="min-h-dvh bg-white text-neutral-900">
            <ScrollToTop />
            <Header />
            <main>
                <Outlet />
            </main>
            <KakaoFloating />
            <ScrollTopFloating />
            <Footer />
        </div>
    );
}
