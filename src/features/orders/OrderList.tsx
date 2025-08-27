import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrders, deleteOrder, type Order } from './useOrders'
import { useSnackbar } from '@/shared/components/Snackbar'
import Layout from '@/shared/components/Layout'
import ConfirmModal from '@/shared/components/ConfirmModal'

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const OrderTableSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </td>
    </tr>
  ))

export default function OrderList() {
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const {
    data: orders,
    loading,
    page,
    hasMore,
    nextPage,
    prevPage,
  } = useOrders(debouncedSearchTerm)

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  const handleDelete = async () => {
    if (!orderToDelete) return
    try {
      await deleteOrder(orderToDelete.id)
      showSnackbar('success', 'Pesanan berhasil dihapus')
    } catch (error) {
      showSnackbar('error', 'Gagal menghapus pesanan')
    } finally {
      setOrderToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pesanan
          </h1>
          <div className="flex-grow flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari nama pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
            <button
              onClick={() => navigate('/orders/new')}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition w-full md:w-auto justify-center"
            >
              <Plus size={18} />
              Tambah Pesanan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Pelanggan</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Cabang</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <OrderTableSkeleton />
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(
                        order.createdAt?.seconds * 1000,
                      ).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {order.branch}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/orders/edit/${order.id}`)}
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full transition"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    {debouncedSearchTerm
                      ? `Pesanan dengan nama pelanggan "${debouncedSearchTerm}" tidak ditemukan.`
                      : 'Belum ada pesanan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">Halaman {page + 1}</span>
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={page === 0 || loading}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              onClick={nextPage}
              disabled={!hasMore || loading}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!orderToDelete}
        onCancel={() => setOrderToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Pesanan"
        message={`Yakin ingin menghapus pesanan untuk "${orderToDelete?.customerName}"?`}
      />
    </Layout>
  )
}
