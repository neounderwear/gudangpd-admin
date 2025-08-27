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
  useCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryFormData,
} from './useCategories'
import { useSnackbar } from '@/shared/components/Snackbar'
import Layout from '@/shared/components/Layout'
import Modal from '@/shared/components/Modal'
import ConfirmModal from '@/shared/components/ConfirmModal'
import CategoryForm from './CategoryForm'

const CategoryTableSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
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

export default function CategoryList() {
  const { showSnackbar } = useSnackbar()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const {
    data: categories,
    loading,
    page,
    hasMore,
    nextPage,
    prevPage,
  } = useCategories(debouncedSearchTerm)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  )
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  const handleAddNew = () => {
    setSelectedCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteRequest = (category: Category) => {
    setSelectedCategory(category)
    setIsConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return
    try {
      await deleteCategory(selectedCategory.id)
      showSnackbar('success', 'Kategori berhasil dihapus')
    } catch {
      showSnackbar('error', 'Gagal menghapus kategori')
    } finally {
      setIsConfirmOpen(false)
      setSelectedCategory(null)
    }
  }

  const handleSubmit = async (data: CategoryFormData) => {
    setActionLoading(true)
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data)
        showSnackbar('success', 'Kategori berhasil diperbarui')
      } else {
        await addCategory(data)
        showSnackbar('success', 'Kategori berhasil ditambahkan')
      }
      setIsFormOpen(false)
      setSelectedCategory(null)
    } catch {
      showSnackbar('error', 'Gagal menyimpan kategori')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Kategori
          </h1>
          <div className="flex-grow flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari kategori..."
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
              Tambah Kategori
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <CategoryTableSkeleton />
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-sm">
                      {cat.description || '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {cat.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(cat)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    {searchTerm
                      ? `Kategori dengan nama "${searchTerm}" tidak ditemukan.`
                      : 'Belum ada kategori.'}
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
          setSelectedCategory(null)
        }}
        title={selectedCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <CategoryForm
          onSubmit={handleSubmit}
          editData={selectedCategory}
          loading={actionLoading}
        />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kategori"
        message={`Yakin ingin menghapus kategori "${selectedCategory?.name}"?`}
      />
    </Layout>
  )
}
