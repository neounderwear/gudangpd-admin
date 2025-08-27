import { useFirestoreQuery } from '@/shared/hooks/useFirestoreQuery'
import { db, storage } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

export interface VariantValue {
  sku: string
  stock: number
  value: string
}
export interface Variant {
  type: string
  values: VariantValue[]
}
export interface Product extends DocumentData {
  id: string
  name: string
  description: string
  brandId: string
  categoryId: string
  images: string[]
  videoUrl?: string
  status: 'active' | 'inactive'
  retailPrice: number
  resellerPrice: number
  wholesalePrice: number
  discountPrice?: number | null
  variants: Variant[]
  createdAt?: any
  updatedAt?: any
}
export type ProductFormData = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'images'
> & {
  newImages: File[]
  existingImages: string[]
}

export function useProducts(searchTerm: string) {
  return useFirestoreQuery<Product>('products', 'name', searchTerm)
}

async function uploadProductImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => {
    const fileRef = ref(storage, `products/${Date.now()}_${file.name}`)
    return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef))
  })
  return Promise.all(uploadPromises)
}

async function deleteProductImages(urls: string[]) {
  const deletePromises = urls.map((url) => {
    const imageRef = ref(storage, url)
    return deleteObject(imageRef).catch((err) =>
      console.error('Gagal hapus gambar lama:', err),
    )
  })
  await Promise.all(deletePromises)
}

export async function addProduct(data: ProductFormData) {
  const imageUrls = await uploadProductImages(data.newImages)
  const dataToSave = {
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
    images: imageUrls,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await addDoc(collection(db, 'products'), dataToSave)
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
  originalImages: string[],
) {
  let newImageUrls: string[] = []
  if (data.newImages.length > 0) {
    newImageUrls = await uploadProductImages(data.newImages)
  }
  const imagesToDelete = originalImages.filter(
    (img) => !data.existingImages.includes(img),
  )
  if (imagesToDelete.length > 0) {
    await deleteProductImages(imagesToDelete)
  }
  const finalImages = [...data.existingImages, ...newImageUrls]
  const dataToUpdate = {
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
    images: finalImages,
    updatedAt: serverTimestamp(),
  }
  await updateDoc(doc(db, 'products', id), dataToUpdate)
}

export async function deleteProduct(product: Product) {
  await deleteDoc(doc(db, 'products', product.id))
  if (product.images && product.images.length > 0) {
    await deleteProductImages(product.images)
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Product
}
