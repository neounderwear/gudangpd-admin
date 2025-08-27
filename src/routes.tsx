import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/LoginPage'
import Dashboard from '@/features/dashboard/Dashboard'
import BannerList from '@/features/banners/BannerList'
import BrandList from '@/features/brands/BrandList'
import CategoryList from '@/features/categories/CategoryList'
import ProductList from '@/features/products/ProductList'
import OrderList from '@/features/orders/OrderList'
import PrivateRoute from '@/shared/components/PrivateRoute'
import ProductPreview from './features/products/ProductPreview'
import { useAuthContext } from '@/context/AuthContext'
import ProductFormPage from './features/products/ProductFormPage'
import OrderFormPage from './features/orders/OrderFormPage'

function AppRoutesWrapper() {
  const { user } = useAuthContext()

  const router = createBrowserRouter([
    {
      path: '/login',
      element: user ? <Navigate to="/" replace /> : <LoginPage />,
      errorElement: <div>Halaman tidak ditemukan</div>,
    },
    {
      path: '/',
      element: (
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      ),
      errorElement: <div>Halaman tidak ditemukan</div>,
    },
    {
      path: '/banners',
      element: (
        <PrivateRoute>
          <BannerList />
        </PrivateRoute>
      ),
    },
    {
      path: '/brands',
      element: (
        <PrivateRoute>
          <BrandList />
        </PrivateRoute>
      ),
    },
    {
      path: '/categories',
      element: (
        <PrivateRoute>
          <CategoryList />
        </PrivateRoute>
      ),
    },
    {
      path: '/products',
      element: (
        <PrivateRoute>
          <ProductList />
        </PrivateRoute>
      ),
    },
    {
      path: '/products/new',
      element: <ProductFormPage />,
    },
    {
      path: '/products/edit/:id',
      element: <ProductFormPage />,
    },
    {
      path: '/products/preview/:id',
      element: <ProductPreview />,
    },

    {
      path: '/orders',
      element: (
        <PrivateRoute>
          <OrderList />
        </PrivateRoute>
      ),
    },
    {
      path: '/orders/new',
      element: <OrderFormPage />,
    },
    {
      path: '/orders/edit/:id',
      element: <OrderFormPage />,
    },
  ])

  return <RouterProvider router={router} />
}

export default AppRoutesWrapper
