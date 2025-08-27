import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

type SnackbarType = 'success' | 'error' | 'warning'

interface Snackbar {
  id: number
  type: SnackbarType
  message: string
}

interface SnackbarContextProps {
  showSnackbar: (type: SnackbarType, message: string) => void
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined,
)

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context)
    throw new Error('useSnackbar must be used inside SnackbarProvider')
  return context
}

const SNACKBAR_STYLES = {
  success: {
    Icon: CheckCircle2,
    className: 'bg-green-50 border-green-400 text-green-700',
    title: 'Success',
  },
  error: {
    Icon: XCircle,
    className: 'bg-red-50 border-red-400 text-red-700',
    title: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-400 text-yellow-700',
    title: 'Warning',
  },
}

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snacks, setSnacks] = useState<Snackbar[]>([])

  const showSnackbar = (type: SnackbarType, message: string) => {
    const id = Date.now()
    setSnacks((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      removeSnackbar(id)
    }, 5000)
  }

  const removeSnackbar = (id: number) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="fixed top-4 inset-x-4 sm:right-4 sm:left-auto flex flex-col items-center sm:items-end space-y-3 z-50">
        <AnimatePresence>
          {snacks.map((snack) => {
            const { Icon, className, title } = SNACKBAR_STYLES[snack.type]

            return (
              <motion.div
                key={snack.id}
                layout
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={clsx(
                  'flex items-start w-full max-w-sm rounded-lg shadow-xl p-4 border-l-4',
                  className,
                )}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm opacity-90">{snack.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeSnackbar(snack.id)}
                    className="inline-flex rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </SnackbarContext.Provider>
  )
}
