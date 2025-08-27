import { useFirestoreQuery } from '@/shared/hooks/useFirestoreQuery'
import { db } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  type DocumentData,
} from 'firebase/firestore'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}
export interface Order extends DocumentData {
  id: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  branch: string
  createdAt?: any
  updatedAt?: any
}
export type OrderFormData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>

export function useOrders(searchTerm: string) {
  return useFirestoreQuery<Order>('orders', 'customerName', searchTerm)
}

export async function addOrder(data: OrderFormData) {
  await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
export async function updateOrder(id: string, data: OrderFormData) {
  await updateDoc(doc(db, 'orders', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
export async function deleteOrder(id: string) {
  await deleteDoc(doc(db, 'orders', id))
}
export async function getOrderById(id: string): Promise<Order | null> {
  const docRef = doc(db, 'orders', id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as Order
}
