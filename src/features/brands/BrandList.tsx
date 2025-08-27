import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  type Brand,
  type BrandFormData,
} from './useBrands'
import { useSnackbar } from '@/shared/components/Snackbar'
import Layout from '@/shared/components/Layout'
import Modal from '@/shared/components/Modal'
import ConfirmModal from '@/shared/components/ConfirmModal'
import BrandForm from './BrandForm'

const BrandTableSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </td>
    </tr>
  ))

export default function BrandList() {
  const { showSnackbar } = useSnackbar()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const {
    data: brands,
    loading,
    page,
    hasMore,
    nextPage,
    prevPage,
  } = useBrands(debouncedSearchTerm)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  const handleAddNew = () => {
    setSelectedBrand(null)
    setIsFormOpen(true)
  }

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsFormOpen(true)
  }

  const handleDeleteRequest = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return
    try {
      await deleteBrand(selectedBrand)
      showSnackbar('success', 'Brand berhasil dihapus')
    } catch {
      showSnackbar('error', 'Gagal menghapus brand')
    } finally {
      setIsConfirmOpen(false)
      setSelectedBrand(null)
    }
  }

  const handleSubmit = async (data: BrandFormData) => {
    setActionLoading(true)
    try {
      if (selectedBrand) {
        await updateBrand(selectedBrand.id, data, selectedBrand.logoUrl)
        showSnackbar('success', 'Brand berhasil diperbarui')
      } else {
        await addBrand(data)
        showSnackbar('success', 'Brand berhasil ditambahkan')
      }
      setIsFormOpen(false)
      setSelectedBrand(null)
    } catch (error) {
      console.error(error)
      showSnackbar('error', 'Gagal menyimpan brand')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Brand</h1>
          <div className="flex-grow flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition w-full md:w-auto justify-center"
            >
              <Plus size={18} />
              Tambah Brand
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Logo</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <BrandTableSkeleton />
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={brand.logoUrl || 'https://via.placeholder.com/40'}
                        alt={brand.name}
                        className="h-10 w-10 object-contain rounded-full bg-gray-100"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {brand.name}
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">
                      {brand.description || '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {brand.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(brand)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && brands.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    {searchTerm
                      ? `Brand dengan nama "${searchTerm}" tidak ditemukan.`
                      : 'Belum ada brand.'}
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedBrand(null)
        }}
        title={selectedBrand ? 'Edit Brand' : 'Tambah Brand Baru'}
      >
        <BrandForm
          editData={selectedBrand}
          onSubmit={handleSubmit}
          loading={actionLoading}
        />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false)
          setSelectedBrand(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Brand"
        message={`Yakin ingin menghapus brand "${selectedBrand?.name}"?`}
      />
    </Layout>
  )
}
