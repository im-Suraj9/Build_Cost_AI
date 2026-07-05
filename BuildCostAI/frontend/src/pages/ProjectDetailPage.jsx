import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  ArrowLeft, Download, Trash2, IndianRupee, Layers,
  Clock, Lightbulb, Package, TrendingDown, Building,
  MapPin, Calendar, Star
} from 'lucide-react'

const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b','#06b6d4','#ec4899','#84cc16']

const fmt = (n) => {
  if (!n) return '₹0'
  return n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : `₹${(n/100000).toFixed(2)} L`
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Building },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'optimize', label: 'Optimize', icon: TrendingDown },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(() => { toast.error('Project not found'); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      navigate('/dashboard')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('token')
    window.open(`/api/projects/${id}/pdf?token=${token}`, '_blank')
    fetch(`/api/projects/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url
        a.download = `${project.name}-report.pdf`; a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => toast.error('PDF generation failed'))
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="h-36 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  )

  if (!project) return null

  const { estimate, materials, timeline, optimizations, costBreakdown } = project

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white truncate">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location.city}</span>
            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{project.plotSize} sqft · {project.floors} floor{project.floors > 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
            <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">{project.materialQuality}</span>
            <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{project.buildingType}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cost hero */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-brand-100 text-sm mb-1">Total Estimated Cost</p>
            <p className="font-display text-3xl font-bold">{fmt(estimate?.totalCost)}</p>
            <p className="text-brand-200 text-xs mt-1">₹{estimate?.costPerSqFt?.toLocaleString()} per sqft</p>
          </div>
          <div>
            <p className="text-brand-100 text-sm mb-1">Minimum (–{Math.round((1 - estimate?.minCost/estimate?.totalCost)*100)}%)</p>
            <p className="font-display text-2xl font-bold">{fmt(estimate?.minCost)}</p>
          </div>
          <div>
            <p className="text-brand-100 text-sm mb-1">Maximum (+{Math.round((estimate?.maxCost/estimate?.totalCost - 1)*100)}%)</p>
            <p className="font-display text-2xl font-bold">{fmt(estimate?.maxCost)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${tab === id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Cost breakdown pie */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Cost Breakdown</h3>
            {costBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="amount">
                      {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {costBreakdown.map((item, i) => (
                    <div key={item.category} className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 text-gray-700 dark:text-gray-300">{item.category}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{fmt(item.amount)}</span>
                      <span className="text-gray-400 text-xs w-8 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-gray-400 text-sm">No breakdown available</p>}
          </div>

          {/* Bar chart */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Cost by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costBreakdown?.slice(0,6)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="amount" fill="#f97316" radius={[0,6,6,0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab: Materials */}
      {tab === 'materials' && (
        <div className="animate-fade-in space-y-4">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="section-title">Material Quantity Estimate</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Based on {project.plotSize * project.floors} sqft total area, {project.materialQuality} quality</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Material</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {materials?.map((mat, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{mat.name}</td>
                      <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                        {mat.quantity.toLocaleString()} <span className="text-xs">{mat.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">₹{mat.unitCost.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(mat.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-brand-50 dark:bg-brand-900/20">
                    <td colSpan="3" className="px-5 py-3 font-bold text-gray-900 dark:text-white">Total Materials</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-600 dark:text-brand-400">
                      {fmt(materials?.reduce((s, m) => s + m.totalCost, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">Material Cost Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={materials?.slice(0,8)}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => fmt(v)} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <Bar dataKey="totalCost" fill="#f97316" radius={[6,6,0,0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {tab === 'timeline' && (
        <div className="animate-fade-in space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="section-title">Total Duration</h3>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {timeline?.totalMonths} months
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({timeline?.totalDays} days)</span>
                </p>
              </div>
            </div>

            {/* Gantt-style timeline */}
            <div className="space-y-3">
              {timeline?.phases?.map((phase, i) => {
                const pct = Math.round(phase.duration / timeline.totalDays * 100)
                const offset = Math.round(phase.startDay / timeline.totalDays * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{phase.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{phase.duration} days</span>
                    </div>
                    <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                      <div
                        className="absolute h-full rounded-lg flex items-center px-2 text-xs font-medium text-white transition-all"
                        style={{
                          left: `${offset}%`,
                          width: `${Math.max(pct, 8)}%`,
                          background: `hsl(${20 + i * 25}, 85%, 55%)`
                        }}
                      >
                        {pct > 10 && `${pct}%`}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{phase.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phase table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phase</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">End</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {timeline?.phases?.map((phase, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{phase.name}</td>
                    <td className="px-5 py-3 text-right text-gray-500">Day {phase.startDay}</td>
                    <td className="px-5 py-3 text-right text-gray-500">Day {phase.endDay}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">{phase.duration} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Optimizations */}
      {tab === 'optimize' && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-sm text-green-700 dark:text-green-300">
            <p className="font-semibold text-base mb-1 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Potential Total Savings
            </p>
            <p className="text-3xl font-display font-bold">
              {fmt(optimizations?.reduce((s, o) => s + o.potentialSaving, 0))}
            </p>
            <p className="text-xs mt-1 opacity-80">By implementing all suggestions below</p>
          </div>

          <div className="space-y-4">
            {optimizations?.map((opt, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">{opt.category}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                          Save {fmt(opt.potentialSaving)}
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                          {opt.savingPercent}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{opt.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
