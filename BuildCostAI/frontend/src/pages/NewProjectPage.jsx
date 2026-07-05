import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, Upload, Zap, ChevronRight, ChevronLeft, CheckCircle, X, FileImage } from 'lucide-react'

const CITIES = [
  'Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata',
  'Ahmedabad','Jaipur','Lucknow','Chandigarh','Surat','Nagpur','Indore',
  'Bhopal','Patna','Vadodara','Ghaziabad','Ludhiana','Agra','Nashik','Faridabad'
]

const STEPS = [
  { title: 'Basic Info', desc: 'Project name & building type' },
  { title: 'Dimensions', desc: 'Plot size & floors' },
  { title: 'Location', desc: 'City & coordinates' },
  { title: 'Finish', desc: 'Material quality & upload' },
]

const qualityOptions = [
  {
    value: 'basic', label: 'Basic', price: '₹1,200–1,500/sqft',
    features: ['Standard cement & bricks', 'Ceramic tiles', 'Basic fittings', 'Simple paint'],
    color: 'border-green-400 bg-green-50 dark:bg-green-900/10',
    badge: 'bg-green-100 text-green-700'
  },
  {
    value: 'standard', label: 'Standard', price: '₹1,700–2,200/sqft',
    features: ['Branded materials', 'Vitrified tiles', 'Quality fittings', 'Texture paint'],
    color: 'border-brand-400 bg-brand-50 dark:bg-brand-900/10',
    badge: 'bg-brand-100 text-brand-700',
    recommended: true
  },
  {
    value: 'premium', label: 'Premium', price: '₹2,500–4,000/sqft',
    features: ['Premium materials', 'Italian marble/hardwood', 'Modular kitchen', 'Smart features'],
    color: 'border-purple-400 bg-purple-50 dark:bg-purple-900/10',
    badge: 'bg-purple-100 text-purple-700'
  }
]

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const [form, setForm] = useState({
    name: '',
    buildingType: 'residential',
    plotSize: '',
    floors: '1',
    city: 'Mumbai',
    state: '',
    materialQuality: 'standard',
    notes: ''
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles[0]) setUploadedFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.buildingType
    if (step === 1) return form.plotSize && Number(form.plotSize) >= 100 && form.floors
    if (step === 2) return form.city
    return true
  }

  const handleSubmit = async () => {
    if (!canNext()) return
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (uploadedFile) formData.append('buildingPlan', uploadedFile)

      const payload = {
        name: form.name,
        plotSize: Number(form.plotSize),
        floors: Number(form.floors),
        location: { city: form.city, state: form.state },
        buildingType: form.buildingType,
        materialQuality: form.materialQuality,
        notes: form.notes
      }

      const { data } = await api.post('/projects', payload)
      toast.success('Project created! AI estimates ready 🎉')
      navigate(`/dashboard/project/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">New Cost Estimate</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered construction cost analysis</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === step ? 'bg-brand-500 text-white' :
              i < step ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' :
              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-brand-300' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6 lg:p-8">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{STEPS[0].title}</h2>
            <div>
              <label className="label">Project Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="input" placeholder="e.g. My Dream Home, Office Block A" />
            </div>
            <div>
              <label className="label">Building Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'residential', label: 'Residential', desc: 'Home, villa, apartment', emoji: '🏠' },
                  { value: 'commercial', label: 'Commercial', desc: 'Office, shop, hotel', emoji: '🏢' },
                  { value: 'industrial', label: 'Industrial', desc: 'Warehouse, factory', emoji: '🏭' },
                  { value: 'mixed', label: 'Mixed Use', desc: 'Residential + commercial', emoji: '🏘️' }
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('buildingType', opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${form.buildingType === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'}`}>
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <p className={`text-sm font-semibold ${form.buildingType === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Dimensions */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{STEPS[1].title}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Plot Size (sq ft) *</label>
                <input type="number" value={form.plotSize} onChange={e => set('plotSize', e.target.value)}
                  className="input" placeholder="e.g. 1500" min="100" max="500000" />
                <p className="text-xs text-gray-400 mt-1">Typical home: 800–3000 sqft</p>
              </div>
              <div>
                <label className="label">Number of Floors *</label>
                <select value={form.floors} onChange={e => set('floors', e.target.value)} className="input">
                  {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => (
                    <option key={n} value={n}>{n} Floor{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            {form.plotSize && form.floors && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Total Built-up Area</p>
                <p className="text-2xl font-display font-bold mt-1">{(Number(form.plotSize) * Number(form.floors)).toLocaleString()} sq ft</p>
                <p className="text-xs opacity-70 mt-1">{form.plotSize} sqft × {form.floors} floors</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{STEPS[2].title}</h2>
            <div>
              <label className="label">City *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={form.city} onChange={e => set('city', e.target.value)} className="input pl-10">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">City affects material & labour costs significantly</p>
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" value={form.state} onChange={e => set('state', e.target.value)}
                className="input" placeholder="e.g. Maharashtra" />
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
              <p className="font-semibold mb-1">City Cost Multipliers</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[['Mumbai', '1.45x'], ['Delhi', '1.35x'], ['Bangalore', '1.30x'], ['Pune', '1.25x'],
                  ['Chennai', '1.20x'], ['Chandigarh', '1.10x'], ['Jaipur', '1.0x'], ['Lucknow', '0.95x']].map(([c, m]) => (
                  <span key={c} className={`flex justify-between ${form.city === c ? 'font-semibold' : ''}`}>
                    <span>{c}</span><span>{m}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Quality & Upload */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{STEPS[3].title}</h2>
            <div>
              <label className="label">Material Quality *</label>
              <div className="space-y-3">
                {qualityOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('materialQuality', opt.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${form.materialQuality === opt.value ? opt.color + ' border-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badge}`}>{opt.label}</span>
                        {opt.recommended && <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{opt.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {opt.features.map(f => (
                        <span key={f} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="label">Building Plan (optional)</label>
              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <FileImage className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300 flex-1 truncate">{uploadedFile.name}</span>
                  <button type="button" onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isDragActive ? 'Drop it here' : 'Upload floor plan or PDF'}</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB · JPG, PNG, PDF</p>
                </div>
              )}
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                className="input resize-none" rows={3} placeholder="Any special requirements, preferences, or notes..." />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}
            className="btn-secondary flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
              className="btn-primary flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !canNext()} className="btn-primary flex items-center gap-2 px-8">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>
              ) : (
                <><Zap className="w-4 h-4" />Generate AI Estimate</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
