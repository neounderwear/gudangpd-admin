import { useState, useEffect } from 'react'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  getCountFromServer,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import type { Order } from '@/features/orders/useOrders'

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalBrands: number
  totalCategories: number
}

export interface ChartData {
  name: string
  total: number
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const productsCol = collection(db, 'products')
        const brandsCol = collection(db, 'brands')
        const categoriesCol = collection(db, 'categories')
        const ordersCol = collection(db, 'orders')

        const [productsCount, brandsCount, categoriesCount, ordersCount] =
          await Promise.all([
            getCountFromServer(productsCol),
            getCountFromServer(brandsCol),
            getCountFromServer(categoriesCol),
            getCountFromServer(ordersCol),
          ])

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const ordersForCalcQuery = query(
          collection(db, 'orders'),
          where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        )

        onSnapshot(ordersForCalcQuery, (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => doc.data() as Order)

          const totalRevenue = ordersData
            .filter((order) => ['completed', 'paid'].includes(order.status))
            .reduce((sum, order) => sum + order.total, 0)

          const salesByDay: { [key: string]: number } = {}
          for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const key = d.toLocaleDateString('id-ID', { weekday: 'short' })
            salesByDay[key] = 0
          }
          ordersData.forEach((order) => {
            if (order.createdAt) {
              const date = order.createdAt.toDate()
              const key = date.toLocaleDateString('id-ID', { weekday: 'short' })
              if (salesByDay.hasOwnProperty(key)) {
                salesByDay[key] += order.total
              }
            }
          })
          const formattedChartData = Object.entries(salesByDay)
            .map(([name, total]) => ({ name, total }))
            .reverse()
          setChartData(formattedChartData)

          setStats({
            totalRevenue,
            totalOrders: ordersCount.data().count,
            totalProducts: productsCount.data().count,
            totalBrands: brandsCount.data().count,
            totalCategories: categoriesCount.data().count,
          })
        })

        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5),
        )
        onSnapshot(recentOrdersQuery, (snapshot) => {
          setRecentOrders(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[],
          )
        })
      } catch (error) {
        console.error('Gagal memuat data dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  return { stats, recentOrders, chartData, loading }
}
