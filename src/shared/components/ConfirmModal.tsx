import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import clsx from 'clsx'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  intent?: 'destructive' | 'primary'
  icon?: ReactNode
}

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  onConfirm,
  onCancel,
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  intent = 'destructive',
  icon = <AlertTriangle size={32} className="text-red-500" />,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
          >
            {icon && (
              <div
                className={clsx(
                  'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
                  {
                    'bg-red-100': intent === 'destructive',
                    'bg-accent': intent === 'primary',
                  },
                )}
              >
                {icon}
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="mt-2 text-gray-600">{message}</p>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={onCancel}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={clsx(
                  'w-full rounded-lg px-4 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-red-600 hover:bg-red-700 focus:ring-red-500':
                      intent === 'destructive',
                    'bg-brand hover:bg-brand/90 focus:ring-brand':
                      intent === 'primary',
                  },
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
