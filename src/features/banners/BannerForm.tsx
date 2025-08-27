import { useState, useEffect } from 'react'
import { useSnackbar } from '@/shared/components/Snackbar'
import {
  addBanner,
  updateBanner,
  type Banner,
  type BannerFormData,
} from './useBanners'
import { UploadCloud, Loader2 } from 'lucide-react'

interface BannerFormProps {
  onSuccess: () => void
  editData?: Banner | null
}

export default function BannerForm({ onSuccess, editData }: BannerFormProps) {
  const { showSnackbar } = useSnackbar()

  const [formData, setFormData] = useState<BannerFormData>({
    name: '',
    link: '',
    isActive: true,
    file: null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        link: editData.link || '',
        isActive: editData.isActive,
        file: null,
      })
      setPreview(editData.photoUrl)
    } else {
      setFormData({ name: '', link: '', isActive: true, file: null })
      setPreview(null)
    }
  }, [editData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || (!editData && !formData.file)) {
      showSnackbar('error', 'Nama dan Gambar Banner wajib diisi.')
      return
    }
    setLoading(true)

    try {
      if (editData) {
        await updateBanner(editData.id, formData, editData.photoUrl)
        showSnackbar('success', 'Banner berhasil diperbarui')
      } else {
        await addBanner(formData)
        showSnackbar('success', 'Banner berhasil ditambahkan')
      }
      onSuccess()
    } catch (error: any) {
      console.error(error)
      showSnackbar('error', error.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = () => {
    setFormData((prev: BannerFormData) => ({
      ...prev,
      isActive: !prev.isActive,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foto Banner
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
          Nama Banner
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="link"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Link (opsional)
        </label>
        <input
          type="text"
          name="link"
          id="link"
          value={formData.link || ''}
          onChange={handleInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Jadikan Aktif</span>
        <button
          type="button"
          onClick={handleToggleActive}
          className={`${formData.isActive ? 'bg-brand' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${formData.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition disabled:bg-brand/50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading
            ? 'Menyimpan...'
            : editData
              ? 'Update Banner'
              : 'Tambah Banner'}
        </button>
      </div>
    </form>
  )
}
