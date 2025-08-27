import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useBanners, deleteBanner, type Banner } from './useBanners'
import { useSnackbar } from '@/shared/components/Snackbar'
import Layout from '@/shared/components/Layout'
import Modal from '@/shared/components/Modal'
import ConfirmModal from '@/shared/components/ConfirmModal'
import BannerForm from './BannerForm'

const BannerTableSkeleton = () =>
  [...Array(3)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-4">
        <div className="h-12 w-20 bg-gray-200 rounded"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

export default function BannerList() {
  const { showSnackbar } = useSnackbar()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const {
    data: banners,
    loading,
    page,
    hasMore,
    nextPage,
    prevPage,
  } = useBanners(debouncedSearchTerm)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null)
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  const handleAddNew = () => {
    setCurrentBanner(null)
    setIsModalOpen(true)
  }

  const handleEdit = (banner: Banner) => {
    setCurrentBanner(banner)
    setIsModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return
    try {
      await deleteBanner(bannerToDelete.id, bannerToDelete.photoUrl)
      showSnackbar('success', 'Banner berhasil dihapus')
    } catch (error) {
      showSnackbar('error', 'Gagal menghapus banner')
    } finally {
      setBannerToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Banner</h1>
          <div className="flex-grow flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari banner..."
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
              Tambah Banner
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Foto</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Link</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <BannerTableSkeleton />
              ) : banners.length > 0 ? (
                banners.map((banner) => (
                  <tr key={banner.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={banner.photoUrl}
                        alt={banner.name}
                        className="h-12 w-20 object-cover rounded"
                      />
                    </td>
                    <td className="p-4 text-gray-700">{banner.name}</td>
                    <td className="p-4">
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {banner.link || '-'}
                      </a>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {banner.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setBannerToDelete(banner)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    {searchTerm
                      ? `Banner dengan nama "${searchTerm}" tidak ditemukan.`
                      : 'Belum ada banner.'}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
      >
        <BannerForm
          editData={currentBanner}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!bannerToDelete}
        onCancel={() => setBannerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Banner"
        message={`Yakin ingin menghapus banner "${bannerToDelete?.name}"?`}
      />
    </Layout>
  )
}
