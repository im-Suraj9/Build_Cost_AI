import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { GitCompare, Plus, X, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : `₹${(n/100000).toFixed(1)}L`

export default function ComparePage() {
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState([null, null])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/projects?limit=50').then(r => setProjects(r.data.projects)).catch(() => {})
  }, [])

  const pick = (index, id) => {
    const p = projects.find(p => p._id === id)
    setSelected(prev => { const n = [...prev]; n[index] = p; return n })
  }

  const [a, b] = selected

  const compare = (key, fn) => {
    if (!a || !b) return null
    const av = fn(a), bv = fn(b)
    if (av === bv) return <Minus className="w-3.5 h-3.5 text-gray-400" />
    return av < bv
      ? <TrendingDown className="w-3.5 h-3.5 text-green-500" />
      : <TrendingUp className="w-3.5 h-3.5 text-red-500" />
  }

  const radarData = a && b ? [
    { metric: 'Cost', a: (a.estimate?.totalCost || 0) / 100000, b: (b.estimate?.totalCost || 0) / 100000 },
    { metric: 'Area', a: (a.plotSize * a.floors) / 100, b: (b.plotSize * b.floors) / 100 },
    { metric: 'Floors', a: a.floors * 20, b: b.floors * 20 },
    { metric: 'Timeline', a: a.timeline?.totalDays || 0, b: b.timeline?.totalDays || 0 },
    { metric: 'Cost/sqft', a: a.estimate?.costPerSqFt || 0, b: b.estimate?.costPerSqFt || 0 },
  ] : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Compare Projects</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Side-by-side analysis of two projects</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map(idx => (
          <div key={idx} className="card p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Project {idx + 1}</p>
            {selected[idx] ? (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selected[idx].name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selected[idx].location.city} · {selected[idx].buildingType}</p>
                  </div>
                  <button onClick={() => setSelected(prev => { const n=[...prev]; n[idx]=null; return n })}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ) : (
              <select onChange={e => pick(idx, e.target.value)} className="input text-sm">
                <option value="">Select a project...</option>
                {projects.filter(p => p._id !== selected[idx===0?1:0]?._id).map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {a && b && (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metric</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-brand-500 uppercase">{a.name}</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-blue-500 uppercase">{b.name}</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  ['Total Cost', p => fmt(p.estimate?.totalCost), p => p.estimate?.totalCost],
                  ['Cost/sqft', p => `₹${p.estimate?.costPerSqFt?.toLocaleString()}`, p => p.estimate?.costPerSqFt],
                  ['Plot Size', p => `${p.plotSize} sqft`, p => p.plotSize],
                  ['Floors', p => `${p.floors} floor${p.floors>1?'s':''}`, p => p.floors],
                  ['Total Area', p => `${(p.plotSize*p.floors).toLocaleString()} sqft`, p => p.plotSize*p.floors],
                  ['Timeline', p => `${p.timeline?.totalMonths||'N/A'} months`, p => p.timeline?.totalDays],
                  ['Quality', p => p.materialQuality, null],
                  ['Location', p => p.location.city, null],
                ].map(([label, display, cmpFn]) => (
                  <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{label}</td>
                    <td className="px-5 py-3 text-center text-brand-600 dark:text-brand-400 font-semibold">{display(a)}</td>
                    <td className="px-5 py-3 text-center text-blue-600 dark:text-blue-400 font-semibold">{display(b)}</td>
                    <td className="px-5 py-3 text-center">
                      {cmpFn && <span className="flex justify-center">{compare(label, cmpFn)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">Comparison Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <Radar name={a.name} dataKey="a" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Radar name={b.name} dataKey="b" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!a && !b && (
        <div className="card p-12 text-center">
          <GitCompare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-display font-semibold text-gray-500 dark:text-gray-400">Select two projects to compare</p>
          {projects.length === 0 && (
            <button onClick={() => navigate('/dashboard/new-project')} className="btn-primary mt-4">
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}
