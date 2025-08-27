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

export interface Banner {
  id: string
  name: string
  link?: string
  photoUrl: string
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}
export type BannerFormData = {
  name: string
  link?: string
  isActive: boolean
  file?: File | null
}

export function useBanners(searchTerm: string) {
  return useFirestoreQuery<Banner>('banners', 'name', searchTerm)
}

const uploadBannerImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `banners/${Date.now()}-${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export const addBanner = async (data: BannerFormData) => {
  if (!data.file) throw new Error('File gambar wajib diisi.')
  const photoUrl = await uploadBannerImage(data.file)
  await addDoc(collection(db, 'banners'), {
    name: data.name,
    link: data.link || '',
    photoUrl,
    isActive: data.isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateBanner = async (
  id: string,
  data: BannerFormData,
  oldPhotoUrl?: string,
) => {
  let photoUrl = oldPhotoUrl
  if (data.file) {
    photoUrl = await uploadBannerImage(data.file)
    if (oldPhotoUrl) {
      await deleteObject(ref(storage, oldPhotoUrl)).catch(() => {})
    }
  }
  await updateDoc(doc(db, 'banners', id), {
    name: data.name,
    link: data.link || '',
    photoUrl,
    isActive: data.isActive,
    updatedAt: serverTimestamp(),
  })
}

export const deleteBanner = async (id: string, photoUrl: string) => {
  await deleteDoc(doc(db, 'banners', id))
  if (photoUrl) {
    await deleteObject(ref(storage, photoUrl)).catch(() => {})
  }
}
