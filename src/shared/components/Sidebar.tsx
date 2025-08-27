import { Link, useLocation } from 'react-router-dom'
import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  LayoutDashboard,
  ImageIcon,
  Ticket,
  Layers3,
  Package,
  ShoppingCart,
  LogOut,
  X,
} from 'lucide-react'
import clsx from 'clsx'

import ConfirmModal from './ConfirmModal'
import { useAuth } from '@/features/auth/useAuth'
import { useSnackbar } from './Snackbar'

const menuItems = [
  { name: 'Beranda', path: '/', icon: LayoutDashboard },
  { name: 'Banner', path: '/banners', icon: ImageIcon },
  { name: 'Merek', path: '/brands', icon: Ticket },
  { name: 'Kategori', path: '/categories', icon: Layers3 },
  { name: 'Produk', path: '/products', icon: Package },
  { name: 'Pesanan', path: '/orders', icon: ShoppingCart },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const { showSnackbar } = useSnackbar()
  const [modalOpen, setModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setModalOpen(false)
    showSnackbar('success', 'Anda berhasil keluar!')
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className={clsx(
          'fixed inset-0 bg-black/50 z-30 md:hidden',
          isOpen ? 'block' : 'hidden',
        )}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-gray-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold">
            Dashboard Admin
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path} className="mb-2">
                  <Link
                    to={item.path}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-brand text-white font-semibold'
                        : 'hover:bg-gray-700',
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-700">
          <button
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/20"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={modalOpen}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi ini?"
        onConfirm={handleLogout}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}
