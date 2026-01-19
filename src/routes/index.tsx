import { createBrowserRouter } from "react-router-dom";

import ClientLayout from "../components/layout/ClientLayout";
import Home from "../pages/client/Home";
import ProductDetail from "../pages/client/ProductDetail";

import AdminLayout from "../components/layout/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminProductList from "../pages/admin/AdminProductList";
import AdminProductEdit from "../pages/admin/AdminProductEdit";
import { adminOnlyGuard } from "./guards";

export const router = createBrowserRouter([
    {
        element: <ClientLayout />,
        children: [
            { path: "/", element: <Home /> },
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

            // ✅ Create: 탭 라우팅
            { path: "products/new/:tab", element: <AdminProductEdit mode="create" /> },
            // 편의상 /new 로 오면 basic으로 리다이렉트(아래 2번에서 처리)
            { path: "products/new", element: <AdminProductEdit mode="create" /> },

            // ✅ Edit: 탭 라우팅
            { path: "products/:id/:tab", element: <AdminProductEdit mode="edit" /> },
            { path: "products/:id", element: <AdminProductEdit mode="edit" /> },
        ],
    },
]);
