import { useState, useEffect, useMemo } from 'react'
import { useSnackbar } from '@/shared/components/Snackbar'
import type { Order, OrderFormData, OrderItem } from './useOrders'
import { useProducts } from '@/features/products/useProducts'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface OrderFormProps {
  editData?: Order | null
  onSubmit: (data: OrderFormData) => Promise<void>
  loading: boolean
}

const storeBranches = [
  'Gudang Pakaian Dalam',
  'Jagoan Underwear',
  'Regino Store',
]

const initialFormState: OrderFormData = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  items: [],
  status: 'pending',
  branch: storeBranches[0],
  subtotal: 0,
  discount: 0,
  total: 0,
}

export default function OrderForm({
  editData,
  onSubmit,
  loading,
}: OrderFormProps) {
  const { data: products, loading: productsLoading } = useProducts('')
  const { showSnackbar } = useSnackbar()
  const [formData, setFormData] = useState<OrderFormData>(initialFormState)

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  useEffect(() => {
    const subtotal = formData.items.reduce(
      (acc: number, item: OrderItem) => acc + item.subtotal,
      0,
    )
    const total = subtotal - formData.discount
    setFormData((prev) => ({ ...prev, subtotal, total }))
  }, [formData.items, formData.discount])

  useEffect(() => {
    if (editData) {
      setFormData(editData)
    } else {
      setFormData(initialFormState)
    }
  }, [editData])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const addItem = () => {
    const newItem: OrderItem = {
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
      subtotal: 0,
    }
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items]
    const item = newItems[index]

    if (field === 'productId') {
      const product = productMap.get(value)
      item.productId = value
      item.productName = product?.name || ''
      item.price = product?.retailPrice || 0
    } else {
      ;(item as any)[field] = value
    }

    item.subtotal = item.quantity * item.price
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_: OrderItem, i: number) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName || !formData.customerPhone) {
      showSnackbar('error', 'Nama & No. HP Pembeli wajib diisi.')
      return
    }
    if (
      formData.items.length === 0 ||
      formData.items.some((item: OrderItem) => !item.productId)
    ) {
      showSnackbar('error', 'Minimal harus ada 1 produk valid dalam pesanan.')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4 p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Data Pembeli</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Pembeli*
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="customerPhone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              No. Handphone*
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="customerAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Alamat (Opsional)
          </label>
          <textarea
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            rows={3}
            className="w-full border-gray-300 rounded-lg shadow-sm"
          />
        </div>
      </fieldset>

      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Item Pesanan</legend>
        <div className="space-y-3">
          {formData.items.map((item: OrderItem, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <select
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, 'productId', e.target.value)
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                >
                  <option value="">
                    {productsLoading ? 'Memuat...' : 'Pilih Produk'}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, 'quantity', Number(e.target.value))
                  }
                  min="1"
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, 'price', Number(e.target.value))
                  }
                  className="w-full border-gray-300 rounded-lg shadow-sm text-sm bg-gray-50"
                />
              </div>
              <div className="col-span-2 text-sm text-right">
                Rp {item.subtotal.toLocaleString('id-ID')}
              </div>
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
        >
          <Plus size={16} /> Tambah Item
        </button>
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <fieldset className="space-y-4 p-4 border rounded-lg">
          <legend className="px-2 font-semibold">Opsi Pesanan</legend>
          <div>
            <label
              htmlFor="branch"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Toko Cabang
            </label>
            <select
              name="branch"
              id="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            >
              {storeBranches.map((branchName) => (
                <option key={branchName} value={branchName}>
                  {branchName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status Pesanan
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </fieldset>

        <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              Rp {formData.subtotal.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="discount" className="text-gray-600">
              Diskon (Rp)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-32 border-gray-300 rounded-lg shadow-sm text-right"
            />
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold text-brand">
            <span>Total</span>
            <span>Rp {formData.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition disabled:bg-brand/50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
        </button>
      </div>
    </form>
  )
}
