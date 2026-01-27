import { createBrowserRouter, useRouteError } from "react-router-dom";

import ClientLayout from "../components/layout/ClientLayout";
import Home from "../pages/client/Home";
import ProductDetail from "../pages/client/ProductDetail";

import ThemeProductsPage, { themeProductsLoader } from "../pages/client/ThemeProductsPage";

import AdminLayout from "../components/layout/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminProductList from "../pages/admin/AdminProductList";
import AdminProductEdit from "../pages/admin/AdminProductEdit";
import AdminThemes from "../pages/admin/AdminThemes";
import { adminOnlyGuard } from "./guards";

import ClientLogin from "../pages/client/ClientLogin";
import MyPage from "../pages/client/MyPage";
import SupportPage from "../pages/client/SupportPage";
import FaqPage from "../pages/client/FaqPage";
import InquiryPage from "../pages/client/InquiryPage";

import AdminBookings from "../pages/admin/AdminBookings";

import NoticesPage from "../pages/client/NoticesPage";
import NoticeDetailPage from "../pages/client/NoticeDetailPage";

import AdminNotices from "../pages/admin/AdminNotices";
import AdminNoticeEdit from "../pages/admin/AdminNoticeEdit";

import AdminBranding from "../pages/admin/AdminBranding";

import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetail from "../pages/admin/AdminUserDetail";

function RouteError() {
    const err = useRouteError() as any;

    const msg =
        err?.message ||
        err?.statusText ||
        (typeof err === "string" ? err : "Unknown error");

    return (
        <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Route Error</h1>
            <p style={{ marginTop: 8 }}>{msg}</p>
            <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}
      </pre>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        element: <ClientLayout />,
        errorElement: <RouteError />,
        children: [
            { path: "/", element: <Home /> },

            { path: "/theme/:slug", element: <ThemeProductsPage />, loader: themeProductsLoader },
            { path: "/product/:id", element: <ProductDetail /> },
            { path: "/login", element: <ClientLogin /> },
            { path: "/me", element: <MyPage /> },

            { path: "/notices", element: <NoticesPage /> },
            { path: "/notices/:id", element: <NoticeDetailPage /> },
            { path: "/faq", element: <FaqPage /> },
            { path: "/support", element: <SupportPage /> },
        ],
    },

    { path: "/admin/login", element: <AdminLogin />, errorElement: <RouteError /> },

    {
        path: "/admin",
        element: <AdminLayout />,
        loader: adminOnlyGuard,
        errorElement: <RouteError />,
        children: [
            { index: true, element: <AdminHome /> },

            { path: "bookings", element: <AdminBookings /> },

            { path: "products", element: <AdminProductList /> },

            { path: "themes", element: <AdminThemes /> },

            { path: "settings/branding", element: <AdminBranding /> },

            { path: "users", element: <AdminUsers /> },
            { path: "users/:id", element: <AdminUserDetail /> },

            { path: "products/new/:tab", element: <AdminProductEdit mode="create" /> },
            { path: "products/new", element: <AdminProductEdit mode="create" /> },

            { path: "products/:id/:tab", element: <AdminProductEdit mode="edit" /> },
            { path: "products/:id", element: <AdminProductEdit mode="edit" /> },

            { path: "notices", element: <AdminNotices /> },
            { path: "notices/new", element: <AdminNoticeEdit mode="create" /> },
            { path: "notices/:id", element: <AdminNoticeEdit mode="edit" /> },
        ],
    },
]);
