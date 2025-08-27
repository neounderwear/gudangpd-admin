import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, type Product } from './useProducts'
import { ArrowLeft, PackageX, ShoppingCart } from 'lucide-react'

const ProductSkeleton = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center p-4 animate-pulse">
    <div className="max-w-5xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-200 w-full aspect-square rounded-lg"></div>
          <div className="flex gap-2 mt-3">
            <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
      </div>
    </div>
  </div>
)

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="text-center">
      <PackageX className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">
        Produk Tidak Ditemukan
      </h2>
      <p className="text-gray-500 mt-2">
        Produk yang Anda cari mungkin telah dihapus atau tidak ada.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition"
      >
        Kembali
      </button>
    </div>
  )
}

export default function ProductPreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        if (!id) return navigate('/products')
        const data = await getProductById(id)
        setProduct(data)
        if (data?.images?.[0]) {
          setSelectedImage(data.images[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  if (loading) return <ProductSkeleton />
  if (!product)
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-4">
        <NotFound />
      </div>
    )

  return (
    <div className="fixed inset-0 bg-gray-50 p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="p-6 sm:p-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-brand font-semibold transition mb-6"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Produk
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-auto aspect-square object-cover rounded-xl shadow-md transition-all duration-300"
              />
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 transition-all duration-200 ${
                      selectedImage === img
                        ? 'border-brand scale-110'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <span
                className={`mb-4 inline-block w-fit px-3 py-1 text-sm font-semibold rounded-full ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {product.status === 'active' ? 'Tersedia' : 'Tidak Aktif'}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {product.description}
              </p>
              <hr className="my-4" />

              <div className="mb-5 space-y-2">
                <p className="text-xl font-semibold text-gray-800">
                  Rp {product.retailPrice.toLocaleString('id-ID')}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Retail)
                  </span>
                </p>
                <p className="text-lg font-medium text-green-600">
                  Rp {product.resellerPrice.toLocaleString('id-ID')}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Reseller)
                  </span>
                </p>
                {product.discountPrice && (
                  <p className="text-lg font-medium text-red-500">
                    Diskon Spesial: Rp{' '}
                    {product.discountPrice.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {product.variants?.map((variant, vIdx) => (
                <div key={vIdx} className="mb-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">
                    Pilih {variant.type}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((val, idx) => (
                      <button
                        key={idx}
                        disabled={val.stock <= 0}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${val.stock > 0 ? 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        {val.value}{' '}
                        <span className="text-xs">({val.stock})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-auto pt-6">
                <button className="w-full bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition duration-300 flex items-center justify-center gap-2">
                  <ShoppingCart size={20} /> Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>

          {product.videoUrl && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Video Produk
              </h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={product.videoUrl.replace('watch?v=', 'embed/')}
                  title="Product Video"
                  className="w-full h-full rounded-xl shadow-md"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
