import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Shield, Save, Camera, Zap } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const roleBadge = { user: { label: 'Homeowner', color: 'badge-blue' }, contractor: { label: 'Contractor', color: 'badge-orange' }, admin: { label: 'Admin', color: 'bg-red-100 text-red-700 badge' } }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border-2 border-gray-100 dark:border-gray-700">
            <Camera className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <span className={roleBadge[user?.role]?.color}>{roleBadge[user?.role]?.label}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />{user?.email}
          </p>
          {user?.isPremium && (
            <div className="flex items-center gap-1.5 mt-1.5 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" /> Premium Member
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Personal Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="input pl-10" placeholder="Your full name" required />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={user?.email} className="input pl-10 opacity-60 cursor-not-allowed" disabled />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="input pl-10" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                className="input pl-10" placeholder="Mumbai, Maharashtra" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-500" /> Account Details
        </h3>
        <div className="space-y-3 text-sm">
          {[
            ['Role', user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
            ['Member Since', new Date(user?.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })],
            ['Account Status', user?.isVerified ? 'Verified' : 'Unverified'],
            ['Plan', user?.isPremium ? 'Premium' : 'Free'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
