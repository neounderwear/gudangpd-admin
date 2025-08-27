import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export interface Option {
  id: string
  name: string
}

export function useProductOptions() {
  const [brands, setBrands] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const brandsQuery = query(
          collection(db, 'brands'),
          where('isActive', '==', true),
        )
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('isActive', '==', true),
        )

        const [brandSnap, categorySnap] = await Promise.all([
          getDocs(brandsQuery),
          getDocs(categoriesQuery),
        ])

        setBrands(
          brandSnap.docs.map((d) => ({ id: d.id, name: d.data().name })),
        )
        setCategories(
          categorySnap.docs.map((d) => ({ id: d.id, name: d.data().name })),
        )
      } catch (error) {
        console.error('Gagal memuat opsi brand/kategori:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  return { brands, categories, loading }
}
