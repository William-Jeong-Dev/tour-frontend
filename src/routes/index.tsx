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

function RouteError() {
    const err = useRouteError() as any;

    // React Router가 던지는 Response 타입 에러도 있어서 최대한 안전하게 출력
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
            { path: "products", element: <AdminProductList /> },

            { path: "themes", element: <AdminThemes /> },

            { path: "products/new/:tab", element: <AdminProductEdit mode="create" /> },
            { path: "products/new", element: <AdminProductEdit mode="create" /> },

            { path: "products/:id/:tab", element: <AdminProductEdit mode="edit" /> },
            { path: "products/:id", element: <AdminProductEdit mode="edit" /> },
        ],
    },
]);
