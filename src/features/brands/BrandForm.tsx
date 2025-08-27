import { useState, useEffect } from 'react'
import { useSnackbar } from '@/shared/components/Snackbar'
import type { Brand, BrandFormData } from './useBrands'
import { UploadCloud, Loader2 } from 'lucide-react'

interface BrandFormProps {
  editData?: Brand | null
  onSubmit: (data: BrandFormData) => Promise<void>
  loading: boolean
}

export default function BrandForm({
  editData,
  onSubmit,
  loading,
}: BrandFormProps) {
  const { showSnackbar } = useSnackbar()
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    isActive: true,
    file: null,
  })
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        description: editData.description || '',
        isActive: editData.isActive,
        file: null,
      })
      setPreview(editData.logoUrl || null)
    } else {
      setFormData({ name: '', description: '', isActive: true, file: null })
      setPreview(null)
    }
  }, [editData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showSnackbar('error', 'Nama brand wajib diisi.')
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo Brand
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="mx-auto h-24 object-contain rounded-md"
              />
            ) : (
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand/90"
              >
                <span>Upload file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">atau drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama Brand*
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
