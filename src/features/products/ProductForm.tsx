import { useState, useEffect } from 'react'
import { useSnackbar } from '@/shared/components/Snackbar'
import {
  type Product,
  type ProductFormData,
  type Variant,
  type VariantValue,
} from './useProducts'
import { useProductOptions } from './useProductOptions'
import { Loader2, UploadCloud, X, Plus, Trash2 } from 'lucide-react'
import isEqual from 'lodash.isequal'

interface ProductFormProps {
  editData?: Product | null
  onSubmit: (data: ProductFormData) => Promise<void>
  loading: boolean
  onFormChange: (isDirty: boolean) => void
}

const initialFormState: ProductFormData = {
  name: '',
  description: '',
  brandId: '',
  categoryId: '',
  status: 'active',
  retailPrice: 0,
  resellerPrice: 0,
  wholesalePrice: 0,
  discountPrice: null,
  variants: [],
  videoUrl: '',
  newImages: [],
  existingImages: [],
}

export default function ProductForm({
  editData,
  onSubmit,
  loading,
  onFormChange,
}: ProductFormProps) {
  const { showSnackbar } = useSnackbar()
  const { brands, categories } = useProductOptions()
  const [formData, setFormData] = useState<ProductFormData>(initialFormState)
  const [initialData, setInitialData] =
    useState<ProductFormData>(initialFormState)

  useEffect(() => {
    if (editData) {
      const data = {
        name: editData.name,
        description: editData.description,
        brandId: editData.brandId,
        categoryId: editData.categoryId,
        status: editData.status,
        retailPrice: editData.retailPrice,
        resellerPrice: editData.resellerPrice,
        wholesalePrice: editData.wholesalePrice,
        discountPrice: editData.discountPrice || null,
        variants: editData.variants || [],
        videoUrl: editData.videoUrl || '',
        newImages: [],
        existingImages: editData.images || [],
      }
      setFormData(data)
      setInitialData(data)
    } else {
      setFormData(initialFormState)
      setInitialData(initialFormState)
    }
  }, [editData])

  useEffect(() => {
    onFormChange(!isEqual(initialData, formData))
  }, [formData, initialData, onFormChange])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    const isNumber = type === 'number'

    if (name === 'discountPrice' && value === '') {
      setFormData((prev) => ({ ...prev, discountPrice: null }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: isNumber ? Number(value) : value,
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...files],
      }))
    }
  }

  const removeImage = (index: number, type: 'new' | 'existing') => {
    if (type === 'new') {
      setFormData((prev) => ({
        ...prev,
        newImages: prev.newImages.filter((_: File, i: number) => i !== index),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter(
          (_: string, i: number) => i !== index,
        ),
      }))
    }
  }

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { type: '', values: [] }],
    }))
  }
  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_: Variant, i: number) => i !== index),
    }))
  }
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData((prev) => ({ ...prev, variants: newVariants }))
  }
  const addVariantValue = (variantIndex: number) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].values.push({ value: '', sku: '', stock: 0 })
    setFormData((prev) => ({ ...prev, variants: newVariants }))
  }
  const removeVariantValue = (variantIndex: number, valueIndex: number) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].values = newVariants[variantIndex].values.filter(
      (_: VariantValue, i: number) => i !== valueIndex,
    )
    setFormData((prev) => ({ ...prev, variants: newVariants }))
  }
  const updateVariantValue = (
    variantIndex: number,
    valueIndex: number,
    field: string,
    value: any,
  ) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].values[valueIndex] = {
      ...newVariants[variantIndex].values[valueIndex],
      [field]: value,
    }
    setFormData((prev) => ({ ...prev, variants: newVariants }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.brandId || !formData.categoryId) {
      showSnackbar('error', 'Nama, Brand, dan Kategori wajib diisi.')
      return
    }
    if (formData.existingImages.length + formData.newImages.length === 0) {
      showSnackbar('error', 'Minimal 1 gambar produk wajib diupload.')
      return
    }
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4 p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Informasi Dasar</legend>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Produk*
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
            rows={4}
            className="w-full border-gray-300 rounded-lg shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="brandId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brand*
            </label>
            <select
              name="brandId"
              id="brandId"
              value={formData.brandId}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm"
            >
              <option value="">Pilih Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategori*
            </label>
            <select
              name="categoryId"
              id="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Status Produk
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                status: prev.status === 'active' ? 'inactive' : 'active',
              }))
            }
            className={`${formData.status === 'active' ? 'bg-brand' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
      </fieldset>

      <fieldset className="space-y-4 p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Harga</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="retailPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Retail
            </label>
            <input
              type="number"
              name="retailPrice"
              id="retailPrice"
              value={formData.retailPrice}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="resellerPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Reseller
            </label>
            <input
              type="number"
              name="resellerPrice"
              id="resellerPrice"
              value={formData.resellerPrice}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="wholesalePrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Grosir
            </label>
            <input
              type="number"
              name="wholesalePrice"
              id="wholesalePrice"
              value={formData.wholesalePrice}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="discountPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Harga Diskon
            </label>
            <input
              type="number"
              name="discountPrice"
              id="discountPrice"
              value={formData.discountPrice ?? ''}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Media</legend>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Produk
          </label>
          <div className="flex flex-wrap gap-4 mt-2">
            {formData.existingImages.map((url: string, i: number) => (
              <div key={`existing-${i}`} className="relative">
                <img
                  src={url}
                  alt="Existing"
                  className="h-24 w-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i, 'existing')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {formData.newImages.map((file: File, i: number) => (
              <div key={`new-${i}`} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i, 'new')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label
              htmlFor="image-upload"
              className="cursor-pointer h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed rounded-md text-gray-400 hover:text-brand hover:border-brand transition"
            >
              <UploadCloud size={32} />
              <span className="text-xs mt-1 font-semibold">Tambah Gambar</span>
            </label>
            <input
              id="image-upload"
              name="image-upload"
              type="file"
              multiple
              className="sr-only"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
        </div>
        <div className="mt-4">
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            URL Video (YouTube)
          </label>
          <input
            type="url"
            name="videoUrl"
            id="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      </fieldset>

      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">Varian Produk</legend>
        <div className="space-y-4">
          {formData.variants.map((variant: Variant, i: number) => (
            <div
              key={i}
              className="p-3 border rounded-md space-y-3 bg-gray-50/50"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={variant.type}
                  onChange={(e) => updateVariant(i, 'type', e.target.value)}
                  placeholder="Tipe Varian (cth: Warna)"
                  className="flex-grow border-gray-300 rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="pl-4 space-y-2">
                {variant.values.map((val: VariantValue, j: number) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val.value}
                      onChange={(e) =>
                        updateVariantValue(i, j, 'value', e.target.value)
                      }
                      placeholder="Nilai (cth: Merah)"
                      className="w-1/3 border-gray-300 rounded-lg shadow-sm text-sm"
                    />
                    <input
                      type="text"
                      value={val.sku}
                      onChange={(e) =>
                        updateVariantValue(i, j, 'sku', e.target.value)
                      }
                      placeholder="SKU"
                      className="w-1/3 border-gray-300 rounded-lg shadow-sm text-sm"
                    />
                    <input
                      type="number"
                      value={val.stock}
                      onChange={(e) =>
                        updateVariantValue(
                          i,
                          j,
                          'stock',
                          Number(e.target.value),
                        )
                      }
                      placeholder="Stok"
                      className="w-1/3 border-gray-300 rounded-lg shadow-sm text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantValue(i, j)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addVariantValue(i)}
                  className="flex items-center gap-1 text-xs text-brand font-semibold hover:underline"
                >
                  <Plus size={14} /> Tambah Nilai Varian
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
        >
          <Plus size={16} /> Tambah Tipe Varian
        </button>
      </fieldset>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition disabled:bg-brand/50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </div>
    </form>
  )
}
