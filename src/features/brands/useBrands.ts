import { useFirestoreQuery } from '@/shared/hooks/useFirestoreQuery'
import { db, storage } from '@/firebase'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

export interface Brand {
  id: string
  name: string
  description?: string
  logoUrl?: string
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}
export type BrandFormData = Omit<
  Brand,
  'id' | 'createdAt' | 'updatedAt' | 'logoUrl'
> & {
  file?: File | null
}

export function useBrands(searchTerm: string) {
  return useFirestoreQuery<Brand>('brands', 'name', searchTerm)
}

const uploadLogo = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `brands/${Date.now()}-${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export const addBrand = async (data: BrandFormData) => {
  let logoUrl = ''
  if (data.file) {
    logoUrl = await uploadLogo(data.file)
  }
  const dataToSave = {
    name: data.name,
    description: data.description || '',
    isActive: data.isActive,
    logoUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await addDoc(collection(db, 'brands'), dataToSave)
}

export const updateBrand = async (
  id: string,
  data: BrandFormData,
  oldLogoUrl?: string,
) => {
  let logoUrl = oldLogoUrl
  if (data.file) {
    logoUrl = await uploadLogo(data.file)
    if (oldLogoUrl) {
      await deleteObject(ref(storage, oldLogoUrl)).catch(() => {})
    }
  }
  const dataToUpdate = {
    name: data.name,
    description: data.description || '',
    isActive: data.isActive,
    logoUrl,
    updatedAt: serverTimestamp(),
  }
  await updateDoc(doc(db, 'brands', id), dataToUpdate)
}

export const deleteBrand = async (brand: Brand) => {
  await deleteDoc(doc(db, 'brands', brand.id))
  if (brand.logoUrl) {
    await deleteObject(ref(storage, brand.logoUrl)).catch(() => {})
  }
}
