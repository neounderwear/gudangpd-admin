import Layout from '@/shared/components/Layout'
import { useDashboard, type ChartData } from './useDashboard'
import type { Order } from '@/features/orders/useOrders'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ShoppingCart, Package, Layers3, Ticket, Wallet } from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  loading: boolean
}) => (
  <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
    {loading ? (
      <div className="animate-pulse w-full">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    ) : (
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    )}
    <div className="bg-brand/10 text-brand p-3 rounded-full">{icon}</div>
  </div>
)

const SalesChart = ({
  data,
  loading,
}: {
  data: ChartData[]
  loading: boolean
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md h-80">
    <h3 className="font-semibold text-gray-800 mb-4">
      Penjualan 7 Hari Terakhir
    </h3>
    {loading ? (
      <div className="animate-pulse w-full h-full flex items-end gap-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            style={{ height: `${Math.random() * 80 + 10}%` }}
            className="w-1/7 bg-gray-200 rounded-t-md"
          ></div>
        ))}
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis
            fontSize={12}
            tickFormatter={(value: number) => `Rp${value / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(166, 122, 77, 0.1)' }}
            formatter={(value: number) => [
              `Rp${value.toLocaleString('id-ID')}`,
              'Total',
            ]}
          />
          <Bar dataKey="total" fill="#A67A4D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
)

const RecentOrdersTable = ({
  orders,
  loading,
}: {
  orders: Order[]
  loading: boolean
}) => {
  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">Pesanan Terbaru</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 font-medium">Pelanggan</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="py-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                  </tr>
                ))
              : orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-700">
                      {order.customerName}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="font-medium">
                      Rp{order.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, recentOrders, chartData, loading } = useDashboard()

  const formatCurrency = (value: number) =>
    `Rp${(value / 1000000).toFixed(1)} Jt`

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Selamat Datang, Admin!
          </h1>
          <p className="text-gray-500 mt-1">
            Berikut adalah ringkasan aktivitas toko Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Pendapatan"
            value={formatCurrency(stats.totalRevenue)}
            icon={<Wallet size={20} />}
            loading={loading}
          />
          <StatCard
            title="Total Pesanan"
            value={stats.totalOrders}
            icon={<ShoppingCart size={20} />}
            loading={loading}
          />
          <StatCard
            title="Total Produk"
            value={stats.totalProducts}
            icon={<Package size={20} />}
            loading={loading}
          />
          <StatCard
            title="Total Kategori"
            value={stats.totalCategories}
            icon={<Layers3 size={20} />}
            loading={loading}
          />
          <StatCard
            title="Total Brand"
            value={stats.totalBrands}
            icon={<Ticket size={20} />}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesChart data={chartData} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <RecentOrdersTable orders={recentOrders} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
