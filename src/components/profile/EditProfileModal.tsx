import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User } from 'lucide-react'
import { updateProfile, type UserProfile } from '../../hooks/useUser'

interface EditProfileModalProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditProfileModal({ user, isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name)
      setInitials(user.avatarInitials)
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await updateProfile(user.id, {
        name: name.trim(),
        avatarInitials: initials.trim() || name.substring(0, 1).toUpperCase()
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to update profile:', err)
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 pb-2">
            <h3 className="text-lg font-bold text-text">Edit Profile</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pb-6 space-y-4">
            <div className="flex items-center gap-4 py-3">
               <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
                 {initials || 'U'}
               </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold text-text">Avatar Preview</p>
                 <p className="text-xs text-text-muted mt-0.5 leading-snug">Changes reflect exactly how you look on App</p>
               </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Avatar Initials</label>
              <input
                type="text"
                maxLength={2}
                placeholder="Ex. AS"
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                className="w-full max-w-[80px] text-center px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full mt-2 py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
