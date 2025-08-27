import { useFirestoreQuery } from '@/shared/hooks/useFirestoreQuery'
import { db } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'

export interface Category extends DocumentData {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}
export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>

export function useCategories(searchTerm: string) {
  return useFirestoreQuery<Category>('categories', 'name', searchTerm)
}

export const addCategory = async (data: CategoryFormData) => {
  await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateCategory = async (
  id: string,
  data: Partial<CategoryFormData>,
) => {
  await updateDoc(doc(db, 'categories', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id))
}
