import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import Cart from './pages/Cart.jsx'
import About from './pages/About.jsx'
import Promotions from './pages/Promotions.jsx'
import SimpleAdminLogin from './pages/admin/SimpleAdminLogin.jsx'
import AdvancedAdminDashboard from './pages/admin/AdvancedAdminDashboard.jsx'
import ProductManagement from './pages/admin/ProductManagement.jsx'
import CategoryManagement from './pages/admin/CategoryManagement.jsx'
import PromotionManagement from './pages/admin/PromotionManagement.jsx'
import ContentManagement from './pages/admin/ContentManagement.jsx'
import OrderManagement from './pages/admin/OrderManagement.jsx'
import PopularProductsManagement from './pages/admin/PopularProductsManagement.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AdminDataProvider } from './context/AdminDataContext.jsx'
import { OrdersProvider } from './context/OrdersContext.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "catalog",
        element: <CatalogPage />
      },
      {
        path: "product/:id",
        element: <ProductPage />
      },
      {
        path: "cart",
        element: <Cart />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "promotions",
        element: <Promotions />
      }
    ]
  },
  {
    path: "/admin",
    element: <SimpleAdminLogin />
  },
  {
    path: "/admin/advanced",
    element: <AdvancedAdminDashboard />
  },
  {
    path: "/admin/advanced/products",
    element: <ProductManagement />
  },
  {
    path: "/admin/advanced/categories",
    element: <CategoryManagement />
  },
  {
    path: "/admin/advanced/promotions",
    element: <PromotionManagement />
  },
  {
    path: "/admin/advanced/content",
    element: <ContentManagement />
  },
  {
    path: "/admin/advanced/orders",
    element: <OrderManagement />
  },
  {
    path: "/admin/advanced/popular",
    element: <PopularProductsManagement />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDataProvider>
      <OrdersProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <div id="toast-root"></div>
        </CartProvider>
      </OrdersProvider>
    </AdminDataProvider>
  </StrictMode>
)