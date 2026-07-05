import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FolderPlus, TrendingUp, Clock, Layers, ChevronRight, Building, Home, Factory, Calendar, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16']

const fmtCost = (n) => {
  if (!n) return '₹0'
  return n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : `₹${(n/100000).toFixed(1)}L`
}

const typeIcons = { residential: Home, commercial: Building, industrial: Factory, mixed: Layers }

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, totalCost: 0, avgCost: 0, totalArea: 0 })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects?limit=20')
        setProjects(data.projects)
        if (data.projects.length > 0) {
          const totalCost = data.projects.reduce((s, p) => s + (p.estimate?.totalCost || 0), 0)
          const totalArea = data.projects.reduce((s, p) => s + (p.plotSize * p.floors), 0)
          setStats({
            total: data.total,
            totalCost,
            avgCost: totalCost / data.projects.length,
            totalArea
          })
        }
      } catch {
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Chart data
  const typeData = projects.reduce((acc, p) => {
    const existing = acc.find(i => i.name === p.buildingType)
    if (existing) existing.value++
    else acc.push({ name: p.buildingType, value: 1 })
    return acc
  }, [])

  const qualityData = projects.reduce((acc, p) => {
    const existing = acc.find(i => i.name === p.materialQuality)
    if (existing) { existing.cost += (p.estimate?.totalCost || 0); existing.count++ }
    else acc.push({ name: p.materialQuality, cost: p.estimate?.totalCost || 0, count: 1 })
    return acc
  }, [])

  const recentProjects = projects.slice(0, 5)

  const statCards = [
    { icon: Layers, label: 'Total Projects', value: stats.total, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { icon: IndianRupee, label: 'Total Estimated', value: fmtCost(stats.totalCost), color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: TrendingUp, label: 'Avg Project Cost', value: fmtCost(stats.avgCost), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Building, label: 'Total Area', value: `${stats.totalArea.toLocaleString()} sqft`, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's an overview of your projects</p>
        </div>
        <button onClick={() => navigate('/dashboard/new-project')} className="btn-primary flex items-center gap-2">
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Estimate</span>
        </button>
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
              <p className="font-display font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost by quality */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Cost by Material Quality</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={qualityData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, textTransform: 'capitalize' }} />
                <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => fmtCost(v)} labelFormatter={l => l.charAt(0).toUpperCase() + l.slice(1)} />
                <Bar dataKey="cost" fill="#f97316" radius={[6,6,0,0]} name="Total Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Building types pie */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Project Types</h3>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend formatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data yet</div>}
          </div>
        </div>
      )}

      {/* Recent projects */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="section-title">Recent Projects</h3>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first cost estimate to get started</p>
            <button onClick={() => navigate('/dashboard/new-project')} className="btn-primary">
              Create First Estimate
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentProjects.map(project => {
              const Icon = typeIcons[project.buildingType] || Building
              return (
                <button key={project._id} onClick={() => navigate(`/dashboard/project/${project._id}`)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {project.location.city} · {project.plotSize} sqft · {project.floors} floor{project.floors > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-sm text-gray-900 dark:text-white">{fmtCost(project.estimate?.totalCost)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{project.materialQuality}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
