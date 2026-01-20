import { createBrowserRouter } from "react-router-dom";

import ClientLayout from "../components/layout/ClientLayout";
import Home from "../pages/client/Home";
import ProductDetail from "../pages/client/ProductDetail";

// ✅ 테마별 상품 페이지
import ThemeProductsPage, { themeProductsLoader } from "../pages/client/ThemeProductsPage";

import AdminLayout from "../components/layout/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminProductList from "../pages/admin/AdminProductList";
import AdminProductEdit from "../pages/admin/AdminProductEdit";
import AdminThemes from "../pages/admin/AdminThemes"; // ✅ 추가
import { adminOnlyGuard } from "./guards";

export const router = createBrowserRouter([
    {
        element: <ClientLayout />,
        children: [
            { path: "/", element: <Home /> },

            // ✅ 테마별 상품 페이지
            { path: "/theme/:slug", element: <ThemeProductsPage />, loader: themeProductsLoader },

            { path: "/product/:id", element: <ProductDetail /> },
        ],
    },

    { path: "/admin/login", element: <AdminLogin /> },
    {
        path: "/admin",
        element: <AdminLayout />,
        loader: adminOnlyGuard,
        children: [
            { index: true, element: <AdminHome /> },
            { path: "products", element: <AdminProductList /> },

            // ✅ 테마 관리
            { path: "themes", element: <AdminThemes /> },

            // ✅ Create: 탭 라우팅
            { path: "products/new/:tab", element: <AdminProductEdit mode="create" /> },
            { path: "products/new", element: <AdminProductEdit mode="create" /> },

            // ✅ Edit: 탭 라우팅
            { path: "products/:id/:tab", element: <AdminProductEdit mode="edit" /> },
            { path: "products/:id", element: <AdminProductEdit mode="edit" /> },
        ],
    },
]);
