import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Hammer, Zap, BarChart3, Clock, Shield, ChevronRight,
  Star, MapPin, Sun, Moon, ArrowRight, CheckCircle,
  Building, Home, Wrench, TrendingDown, Users, FileText
} from 'lucide-react'
import api from '../services/api'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Chandigarh', 'Jaipur', 'Ahmedabad']

const features = [
  { icon: Zap, title: 'AI-Powered Estimates', desc: 'Get instant cost predictions with ±10% accuracy using our ML model trained on real Indian construction data.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { icon: BarChart3, title: 'Detailed Breakdowns', desc: 'Visual cost breakdowns for foundation, structure, MEP, finishing — with material quantity estimates.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Clock, title: 'Timeline Planning', desc: 'Phase-wise construction schedules with realistic durations for each milestone.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: TrendingDown, title: 'Cost Optimization', desc: 'AI-powered suggestions to reduce costs by 15-25% without compromising quality.', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
  { icon: Users, title: 'Contractor Network', desc: 'Browse verified contractors with ratings, reviews, and contact information.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: FileText, title: 'PDF Reports', desc: 'Download professional PDF reports to share with contractors and financiers.', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
]

const stats = [
  { value: '10,000+', label: 'Projects Estimated' },
  { value: '₹2,000Cr+', label: 'Total Costs Estimated' },
  { value: '500+', label: 'Verified Contractors' },
  { value: '95%', label: 'Accuracy Rate' },
]

export default function HomePage() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [quickForm, setQuickForm] = useState({ plotSize: '', floors: '1', city: 'Mumbai', buildingType: 'residential', materialQuality: 'standard' })
  const [quickResult, setQuickResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleQuickEstimate = async (e) => {
    e.preventDefault()
    if (!quickForm.plotSize) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/quick-estimate', quickForm)
      setQuickResult(data.estimate)
    } catch {
      const area = Number(quickForm.plotSize) * Number(quickForm.floors)
      const base = area * 1800 * (quickForm.materialQuality === 'premium' ? 1.55 : quickForm.materialQuality === 'basic' ? 0.75 : 1)
      setQuickResult({ totalCost: base, minCost: base * 0.9, maxCost: base * 1.1, costPerSqFt: Math.round(base / area) })
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : `₹${(n/100000).toFixed(2)}L`

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Hammer className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-white">
              BuildCost<span className="text-brand-500"> AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
            <a href="#estimate" className="hover:text-brand-500 transition-colors">Try It Free</a>
            <a href="#stats" className="hover:text-brand-500 transition-colors">Stats</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 dark:bg-brand-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand-200 dark:border-brand-700/50">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Construction Intelligence
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Build Smarter,<br />
              <span className="gradient-text">Estimate Better</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              Get AI-powered construction cost estimates in seconds. Material breakdowns, timelines, and optimization tips — all tailored to Indian market rates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate(user ? '/dashboard/new-project' : '/register')} className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
                Start Free Estimate
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#estimate" className="btn-secondary text-base px-8 py-3 flex items-center gap-2 justify-center">
                Try Quick Demo
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              {['No credit card required', 'Instant results', 'Indian market rates'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-12 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-brand-500 mb-1">{s.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Estimate */}
      <section id="estimate" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Try It Now — Free</h2>
            <p className="text-gray-600 dark:text-gray-400">Get a quick estimate without signing up</p>
          </div>

          <div className="card p-6 lg:p-8">
            <form onSubmit={handleQuickEstimate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Plot Size (sq ft)</label>
                <input type="number" placeholder="e.g. 1500" value={quickForm.plotSize}
                  onChange={e => setQuickForm(p => ({ ...p, plotSize: e.target.value }))}
                  className="input" required min="100" max="100000" />
              </div>
              <div>
                <label className="label">Number of Floors</label>
                <select value={quickForm.floors} onChange={e => setQuickForm(p => ({ ...p, floors: e.target.value }))} className="input">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Floor{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <select value={quickForm.city} onChange={e => setQuickForm(p => ({ ...p, city: e.target.value }))} className="input">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Building Type</label>
                <select value={quickForm.buildingType} onChange={e => setQuickForm(p => ({ ...p, buildingType: e.target.value }))} className="input">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="label">Material Quality</label>
                <select value={quickForm.materialQuality} onChange={e => setQuickForm(p => ({ ...p, materialQuality: e.target.value }))} className="input">
                  <option value="basic">Basic (Budget)</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating...</> : <><Zap className="w-4 h-4" />Get Estimate</>}
                </button>
              </div>
            </form>

            {quickResult && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cost</p>
                    <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-400">{fmt(quickResult.totalCost)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min Estimate</p>
                    <p className="font-display text-xl font-bold text-gray-900 dark:text-white">{fmt(quickResult.minCost)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Estimate</p>
                    <p className="font-display text-xl font-bold text-gray-900 dark:text-white">{fmt(quickResult.maxCost)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost / sq ft</p>
                    <p className="font-display text-xl font-bold text-gray-900 dark:text-white">₹{quickResult.costPerSqFt}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Want detailed materials, timeline & optimization tips?</p>
                  <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">Everything You Need</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">A complete platform for construction cost management in India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-10 text-white">
            <Hammer className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="font-display text-3xl font-bold mb-3">Start Building Smarter Today</h2>
            <p className="text-brand-100 mb-6">Join thousands of homebuilders and contractors who use BuildCost AI</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Hammer className="w-3 h-3 text-white" />
            </div>
            <span>BuildCost AI © 2024</span>
          </div>
          <p>AI-powered construction cost estimation for India</p>
        </div>
      </footer>
    </div>
  )
}
