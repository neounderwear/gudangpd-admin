import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useSnackbar } from '@/shared/components/Snackbar';
import Layout from '@/shared/components/Layout';
import ConfirmModal from '@/shared/components/ConfirmModal';
import ProductForm from './ProductForm';
import {
  getProductById,
  addProduct,
  updateProduct,
  type ProductFormData,
  type Product,
} from './useProducts';
import { ArrowLeft } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  const initialFormState = useRef<Partial<ProductFormData> | null>(null);
  const isEditMode = !!id;
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getProductById(id)
        .then((data) => {
          if (data) {
            setProduct(data);
            initialFormState.current = {
              name: data.name,
              description: data.description,
              brandId: data.brandId,
              categoryId: data.categoryId,
              status: data.status,
              retailPrice: data.retailPrice,
              resellerPrice: data.resellerPrice,
              wholesalePrice: data.wholesalePrice,
              discountPrice: data.discountPrice,
              variants: data.variants,
              videoUrl: data.videoUrl,
              existingImages: data.images,
            };
          } else {
            showSnackbar('error', 'Produk tidak ditemukan');
            navigate('/products');
          }
        })
        .finally(() => setLoading(false));
    } else {
      initialFormState.current = {
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
        existingImages: [],
      };
    }
  }, [id, isEditMode, navigate, showSnackbar]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (shouldNavigate) {
      navigate('/products');
    }
  }, [shouldNavigate, navigate]);

  const handleSubmit = async (data: ProductFormData) => {
    setActionLoading(true);
    try {
      if (isEditMode && product) {
        await updateProduct(product.id, data, product.images);
        showSnackbar('success', 'Produk berhasil diperbarui');
      } else {
        await addProduct(data);
        showSnackbar('success', 'Produk berhasil ditambahkan');
      }
      setIsDirty(false);
      setShouldNavigate(true);
    } catch (error) {
      console.error(error);
      showSnackbar('error', 'Gagal menyimpan produk');
    } finally {
      setActionLoading(false);
    }
  };

  const title = isEditMode ? 'Edit Produk' : 'Tambah Produk Baru';

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/products')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>

        {loading && isEditMode ? (
          <p>Memuat data produk...</p>
        ) : (
          <ProductForm
            onSubmit={handleSubmit}
            editData={product}
            loading={actionLoading}
            onFormChange={(dirty: boolean) => setIsDirty(dirty)}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={blocker.state === 'blocked'}
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        title="Tinggalkan Halaman?"
        message="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?"
        confirmText="Ya, Tinggalkan"
        intent="destructive"
      />
    </Layout>
  );
}