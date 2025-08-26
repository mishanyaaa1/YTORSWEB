import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { IconContext } from 'react-icons'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import Cart from './pages/Cart.jsx'
// Removed CartTest page
import About from './pages/About.jsx'
import Promotions from './pages/Promotions.jsx'
import VehiclesPage from './pages/VehiclesPage.jsx'
import VehicleDetailPage from './pages/VehicleDetailPage.jsx'
import SimpleAdminLogin from './pages/admin/SimpleAdminLogin.jsx'
import SimpleAdminDashboard from './pages/admin/SimpleAdminDashboard.jsx'
import AdvancedAdminDashboard from './pages/admin/AdvancedAdminDashboard.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
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
      // Removed cart-test route
      // Removed wishlist route
      {
        path: "about",
        element: <About />
      },
      {
        path: "promotions",
        element: <Promotions />
      },
      {
        path: "vehicles",
        element: <VehiclesPage />
      },
      {
        path: "vehicle/:id",
        element: <VehicleDetailPage />
      }
    ]
  },
  {
    path: "/admin",
    element: <SimpleAdminLogin />
  },
  {
    path: "/admin/dashboard",
    element: (
      <RequireAdmin>
        <SimpleAdminDashboard />
      </RequireAdmin>
    )
  },
  {
    path: "/admin/advanced",
    element: (
      <RequireAdmin>
        <AdvancedAdminDashboard />
      </RequireAdmin>
    )
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDataProvider>
      <OrdersProvider>
        <CartProvider>
          <IconContext.Provider value={{ color: '#e6a34a' }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </CartProvider>
      </OrdersProvider>
    </AdminDataProvider>
  </StrictMode>,
)
