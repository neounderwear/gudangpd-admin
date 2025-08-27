import { useState, useEffect } from 'react'
import { useSnackbar } from '@/shared/components/Snackbar'
import type { Category, CategoryFormData } from './useCategories'
import { Loader2 } from 'lucide-react'

interface CategoryFormProps {
  editData?: Category | null
  onSubmit: (data: CategoryFormData) => Promise<void>
  loading: boolean
}

export default function CategoryForm({
  editData,
  onSubmit,
  loading,
}: CategoryFormProps) {
  const { showSnackbar } = useSnackbar()
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        description: editData.description || '',
        isActive: editData.isActive,
      })
    } else {
      setFormData({ name: '', description: '', isActive: true })
    }
  }, [editData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showSnackbar('error', 'Nama kategori wajib diisi.')
      return
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama Kategori*
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Deskripsi
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Jadikan Aktif</span>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
          }
          className={`${formData.isActive ? 'bg-brand' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${formData.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition disabled:bg-brand/50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
