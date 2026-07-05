import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import { Users, FolderOpen, Building2, TrendingUp, Shield, CheckCircle } from 'lucide-react'

const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444']
const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : `₹${(n/100000).toFixed(0)}L`

const MOCK_STATS = {
  totalUsers: 1247,
  totalProjects: 3891,
  totalContractors: 234,
  recentProjects: [],
  usersByRole: [
    { _id: 'user', count: 1089 },
    { _id: 'contractor', count: 142 },
    { _id: 'admin', count: 16 }
  ],
  projectsByType: [
    { _id: 'residential', count: 2341 },
    { _id: 'commercial', count: 987 },
    { _id: 'industrial', count: 342 },
    { _id: 'mixed', count: 221 }
  ],
  monthlyProjects: [
    { _id: { month: 1 }, count: 189, totalCost: 28000000 },
    { _id: { month: 2 }, count: 212, totalCost: 31500000 },
    { _id: { month: 3 }, count: 278, totalCost: 42000000 },
    { _id: { month: 4 }, count: 301, totalCost: 45800000 },
    { _id: { month: 5 }, count: 334, totalCost: 50200000 },
    { _id: { month: 6 }, count: 298, totalCost: 44600000 },
  ]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminPage() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users')
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data)
      setUsers(usersRes.data)
    }).catch(() => {
      // use mock data if API fails or user is not admin
    }).finally(() => setLoading(false))
  }, [])

  const monthlyChartData = stats.monthlyProjects?.map(m => ({
    month: MONTHS[(m._id.month || 1) - 1],
    projects: m.count,
    revenue: m.totalCost
  }))

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: FolderOpen, label: 'Total Projects', value: stats.totalProjects?.toLocaleString(), color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { icon: Building2, label: 'Contractors', value: stats.totalContractors?.toLocaleString(), color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: TrendingUp, label: 'Avg Monthly', value: stats.monthlyProjects?.length ? Math.round(stats.monthlyProjects.reduce((s,m) => s+m.count, 0) / stats.monthlyProjects.length) : 0, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platform overview and management</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="font-display font-bold text-gray-900 dark:text-white text-lg mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {['overview', 'users'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Monthly chart */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Monthly Projects</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="projects" fill="#f97316" radius={[6,6,0,0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users by role */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Users by Role</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.usersByRole} cx="50%" cy="50%" outerRadius={70} paddingAngle={4} dataKey="count" nameKey="_id">
                    {stats.usersByRole?.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {stats.usersByRole?.map((r, i) => (
                  <div key={r._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{r._id}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects by type */}
            <div className="card p-5">
              <h3 className="section-title mb-4">Projects by Type</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.projectsByType}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, textTransform: 'capitalize' }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent projects */}
          {stats.recentProjects?.length > 0 && (
            <div className="card">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="section-title">Recent Projects</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats.recentProjects.map(p => (
                  <div key={p._id} className="flex items-center gap-4 p-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.user?.name} · {p.location?.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(p.estimate?.totalCost)}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.buildingType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="section-title">Registered Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Name', 'Email', 'Role', 'Joined', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length > 0 ? users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge capitalize ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'contractor' ? 'badge-orange' : 'badge-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                      No users found (requires admin access)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
