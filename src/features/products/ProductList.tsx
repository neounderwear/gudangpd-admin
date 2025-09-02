import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts, deleteProduct, type Product } from './useProducts';
import { useProductOptions } from './useProductOptions';
import { useSnackbar } from '@/shared/components/Snackbar';
import Layout from '@/shared/components/Layout';
import ConfirmModal from '@/shared/components/ConfirmModal';

const ProductTableSkeleton = () =>
  [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="p-4">
        <div className="h-16 w-16 bg-gray-200 rounded-md"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
      </td>
    </tr>
  ));

export default function ProductList() {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const {
    data: products,
    loading: productsLoading,
    page,
    hasMore,
    nextPage,
    prevPage,
  } = useProducts('');

  const { brands, categories } = useProductOptions();

  const brandMap = useMemo(
    () => new Map(brands.map((b) => [b.id, b.name])),
    [brands],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      showSnackbar('success', 'Produk berhasil dihapus');
    } catch (error) {
      showSnackbar('error', 'Gagal menghapus produk');
    } finally {
      setProductToDelete(null);
    }
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce(
      (total, variant) =>
        total +
        variant.values.reduce(
          (subtotal, value) => subtotal + (value.stock || 0),
          0,
        ),
      0,
    );
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <div className="flex-grow flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
            <Link
              to="/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition w-full md:w-auto justify-center"
            >
              <Plus size={18} />
              Tambah Produk
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Produk</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Harga Retail</th>
                <th className="p-4 font-semibold">Stok</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <ProductTableSkeleton />
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images?.[0] ||
                            'https://via.placeholder.com/64'
                          }
                          alt={product.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <span className="font-medium text-gray-800">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {brandMap.get(product.brandId) || '-'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {categoryMap.get(product.categoryId) || '-'}
                    </td>
                    <td className="p-4 text-gray-600">
                      Rp {product.retailPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-gray-600">
                      {getTotalStock(product)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Link
                          to={`/products/preview/${product.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            navigate(`/products/edit/${product.id}`)
                          }
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full transition"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
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
              {!productsLoading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    {searchTerm
                      ? `Produk dengan nama "${searchTerm}" tidak ditemukan.`
                      : 'Belum ada produk.'}
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
              disabled={page === 0 || productsLoading}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              onClick={nextPage}
              disabled={!hasMore || productsLoading}
              className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!productToDelete}
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Yakin ingin menghapus produk "${productToDelete?.name}"?`}
      />
    </Layout>
  );
}