import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSnackbar } from '@/shared/components/Snackbar'
import Layout from '@/shared/components/Layout'
import OrderForm from './OrderForm'
import {
  getOrderById,
  addOrder,
  updateOrder,
  type OrderFormData,
  type Order,
} from './useOrders'
import { ArrowLeft } from 'lucide-react'

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      setLoading(true)
      getOrderById(id)
        .then((data) => {
          if (data) {
            setOrder(data)
          } else {
            showSnackbar('error', 'Pesanan tidak ditemukan')
            navigate('/orders')
          }
        })
        .finally(() => setLoading(false))
    }
  }, [id, isEditMode, navigate, showSnackbar])

  const handleSubmit = async (data: OrderFormData) => {
    setActionLoading(true)
    try {
      if (isEditMode && order) {
        await updateOrder(order.id, data)
        showSnackbar('success', 'Pesanan berhasil diperbarui')
      } else {
        await addOrder(data)
        showSnackbar('success', 'Pesanan berhasil ditambahkan')
      }
      navigate('/orders')
    } catch (error) {
      console.error(error)
      showSnackbar('error', 'Gagal menyimpan pesanan')
    } finally {
      setActionLoading(false)
    }
  }

  const title = isEditMode ? 'Edit Pesanan' : 'Tambah Pesanan Baru'

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>

        {loading && isEditMode ? (
          <p>Memuat data pesanan...</p>
        ) : (
          <OrderForm
            onSubmit={handleSubmit}
            editData={order}
            loading={actionLoading}
          />
        )}
      </div>
    </Layout>
  )
}
