import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import Cart from './pages/Cart.jsx'
// Removed Wishlist page
import About from './pages/About.jsx'
import Promotions from './pages/Promotions.jsx'
import SimpleAdminLogin from './pages/admin/SimpleAdminLogin.jsx'
import SimpleAdminDashboard from './pages/admin/SimpleAdminDashboard.jsx'
import AdvancedAdminDashboard from './pages/admin/AdvancedAdminDashboard.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AdminDataProvider } from './context/AdminDataContext.jsx'
// Removed WishlistProvider
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
        // Removed wishlist route
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
    path: "/admin/dashboard",
    element: <SimpleAdminDashboard />
  },
  {
    path: "/admin/advanced",
    element: <AdvancedAdminDashboard />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDataProvider>
      <OrdersProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </OrdersProvider>
    </AdminDataProvider>
  </StrictMode>,
)
