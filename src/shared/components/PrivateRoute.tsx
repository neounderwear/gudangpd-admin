import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-[99]">
    <Loader2 className="h-10 w-10 animate-spin text-brand" />
  </div>
)

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
