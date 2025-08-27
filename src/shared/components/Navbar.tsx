import { Menu, UserCircle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuthContext()

  return (
    <nav className="flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm md:px-6">
      <button onClick={onMenuClick} className="md:hidden text-gray-600">
        <Menu size={24} />
      </button>

      <div className="hidden md:block"></div>

      <div className="flex items-center gap-3">
        <UserCircle size={28} className="text-gray-500" />
        <div className="text-sm">
          <p className="font-semibold text-gray-800">Admin</p>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>
    </nav>
  )
}
