import { useState, useEffect } from 'react'
import api from '../services/api'
import { Star, MapPin, Briefcase, Phone, Globe, CheckCircle, Search, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const SPECIALIZATIONS = ['residential', 'commercial', 'industrial', 'renovation', 'interior', 'civil', 'electrical', 'plumbing']

const mockContractors = [
  { _id: '1', companyName: 'Sharma Constructions Pvt Ltd', specialization: ['residential', 'commercial'], experience: 15, location: { city: 'Mumbai' }, contact: { phone: '+91 98765 43210', email: 'sharma@example.com' }, rating: 4.7, reviewCount: 128, priceRange: { min: 1500, max: 2500 }, isVerified: true, isAvailable: true, bio: 'Leading construction company with 15+ years in Mumbai. Specializing in premium residential and commercial projects.', completedProjects: 234 },
  { _id: '2', companyName: 'Raj Builders & Associates', specialization: ['residential', 'renovation'], experience: 8, location: { city: 'Delhi' }, contact: { phone: '+91 98765 12345' }, rating: 4.3, reviewCount: 67, priceRange: { min: 1200, max: 1900 }, isVerified: true, isAvailable: true, bio: 'Quality residential construction at competitive rates across Delhi NCR.', completedProjects: 89 },
  { _id: '3', companyName: 'Patel Infrastructure', specialization: ['commercial', 'industrial'], experience: 20, location: { city: 'Ahmedabad' }, contact: { phone: '+91 99887 76543' }, rating: 4.9, reviewCount: 203, priceRange: { min: 1800, max: 3200 }, isVerified: true, isAvailable: false, bio: 'Industry leader in commercial and industrial construction across Gujarat.', completedProjects: 412 },
  { _id: '4', companyName: 'Kumar & Sons Construction', specialization: ['residential', 'interior'], experience: 12, location: { city: 'Bangalore' }, contact: { phone: '+91 93456 78901' }, rating: 4.5, reviewCount: 94, priceRange: { min: 1600, max: 2800 }, isVerified: true, isAvailable: true, bio: 'Delivering dream homes across Bangalore with premium finishes.', completedProjects: 156 },
  { _id: '5', companyName: 'South India Contractors', specialization: ['residential', 'civil'], experience: 18, location: { city: 'Chennai' }, contact: { phone: '+91 94321 09876' }, rating: 4.6, reviewCount: 145, priceRange: { min: 1400, max: 2300 }, isVerified: false, isAvailable: true, bio: 'Trusted residential construction contractor since 2006.', completedProjects: 298 },
  { _id: '6', companyName: 'Hyderabad Build Corp', specialization: ['commercial', 'residential'], experience: 10, location: { city: 'Hyderabad' }, contact: { phone: '+91 97654 32109' }, rating: 4.2, reviewCount: 51, priceRange: { min: 1300, max: 2200 }, isVerified: true, isAvailable: true, bio: 'Modern construction solutions for residential and commercial clients.', completedProjects: 78 },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  )
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState(mockContractors)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchContractors = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/contractors')
        if (data.contractors?.length > 0) setContractors(data.contractors)
      } catch { /* use mock data */ }
      finally { setLoading(false) }
    }
    fetchContractors()
  }, [])

  const filtered = contractors.filter(c => {
    const nameMatch = c.companyName.toLowerCase().includes(search.toLowerCase()) || c.location.city.toLowerCase().includes(search.toLowerCase())
    const specMatch = !filterSpec || c.specialization.includes(filterSpec)
    const cityMatch = !filterCity || c.location.city.toLowerCase().includes(filterCity.toLowerCase())
    return nameMatch && specMatch && cityMatch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Contractor Marketplace</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find verified contractors across India</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-sm" placeholder="Search by name or city..." />
        </div>
        <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} className="input text-sm w-auto capitalize">
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="input text-sm w-auto">
          <option value="">All Cities</option>
          {['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Ahmedabad','Chandigarh'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} contractors found</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(contractor => (
          <div key={contractor._id} className="card p-5 hover:-translate-y-0.5 transition-transform cursor-pointer" onClick={() => setSelected(contractor)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm truncate">{contractor.companyName}</h3>
                  {contractor.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{contractor.location.city}</span>
                  <span>·</span>
                  <span>{contractor.experience}yr exp</span>
                </div>
              </div>
              <div className={`shrink-0 w-2.5 h-2.5 rounded-full ml-2 mt-1 ${contractor.isAvailable ? 'bg-green-500' : 'bg-red-400'}`} title={contractor.isAvailable ? 'Available' : 'Busy'} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={contractor.rating} />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{contractor.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({contractor.reviewCount})</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {contractor.specialization.slice(0,3).map(s => (
                <span key={s} className="badge-orange capitalize text-xs">{s}</span>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{contractor.bio}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-400">Price range</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{contractor.priceRange?.min?.toLocaleString()}–{contractor.priceRange?.max?.toLocaleString()}/sqft
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Projects</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{contractor.completedProjects}+</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{selected.companyName}</h2>
                    {selected.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selected.location.city}</span>
                    <StarRating rating={selected.rating} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selected.rating.toFixed(1)} ({selected.reviewCount})</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selected.bio}</p>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="font-display font-bold text-gray-900 dark:text-white">{selected.experience}yr</p>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="font-display font-bold text-gray-900 dark:text-white">{selected.completedProjects}+</p>
                  <p className="text-xs text-gray-500">Projects</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className={`font-display font-bold ${selected.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {selected.isAvailable ? 'Open' : 'Busy'}
                  </p>
                  <p className="text-xs text-gray-500">Availability</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selected.specialization.map(s => (
                  <span key={s} className="badge-orange capitalize">{s}</span>
                ))}
              </div>

              {selected.contact?.phone && (
                <a href={`tel:${selected.contact.phone}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                  <Phone className="w-4 h-4" /> Call Contractor
                </a>
              )}
              {selected.contact?.email && (
                <a href={`mailto:${selected.contact.email}?subject=Construction Project Inquiry`}
                  className="btn-secondary w-full flex items-center justify-center gap-2">
                  Send Email Inquiry
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
