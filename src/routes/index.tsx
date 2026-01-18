import { createBrowserRouter } from "react-router-dom";
import ClientLayout from "../components/layout/ClientLayout";
import Home from "../pages/client/Home";
import ProductDetail from "../pages/client/ProductDetail";

export const router = createBrowserRouter([
    {
        element: <ClientLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/product/:id", element: <ProductDetail /> },
        ],
    },
]);
