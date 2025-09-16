import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { IconContext } from 'react-icons'
import './index.css'
import './global-input-styles.css'
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
import { CartProvider } from './context/CartContext.jsx'

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
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <IconContext.Provider value={{ color: '#e6a34a' }}>
        <RouterProvider router={router} />
      </IconContext.Provider>
    </CartProvider>
  </StrictMode>,
)
