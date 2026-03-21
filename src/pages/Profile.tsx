import { Bell, CircleHelp, LogOut, Moon, Pencil, Plus, Settings, Shield, Trash2, Banknote, CreditCard, Smartphone, ChevronRight, Wallet, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '../hooks/useUser'
import { deleteWallet, useWallets, type Wallet as WalletType } from '../hooks/useWallets'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/currency'
import { AddWalletModal } from '../components/wallet/AddWalletModal'
import { EditBalanceModal } from '../components/wallet/EditBalanceModal'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { AIAdvisor } from '../components/ai/AIAdvisor'
import { DestructiveModal } from '../components/ui/DestructiveModal'
import { bankOptions, ewalletOptions } from '../constants/wallet'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const menuItems = [
  { icon: Bell, label: 'Notifications', subtitle: 'Manage alerts' },
  { icon: Shield, label: 'Security', subtitle: 'Password & biometrics' },
  { icon: Moon, label: 'Dark Mode', subtitle: 'Coming soon', disabled: true },
  { icon: Sparkles, label: 'AI Advisor', subtitle: 'Get financial tips' },
  { icon: CircleHelp, label: 'Help & Support', subtitle: 'FAQ & Contact' },
]



export function ProfilePage() {
  const { user: currentUser, refresh: refreshUser } = useCurrentUser()
  const { wallets, totalBalance, refresh } = useWallets()

  // Modal States
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)
  const [showAddWallet, setShowAddWallet] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null)

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Family Invite Code
  const [inviteCode, setInviteCode] = useState<string>('')

  // Fetch Invite Code
  useEffect(() => {
    async function fetchInviteCode() {
      if (!currentUser?.familyId) return
      try {
        const { data } = await supabase
          .from('families')
          .select('invite_code')
          .eq('id', currentUser.familyId)
          .single()
        if (data) setInviteCode(data.invite_code)
      } catch (err) {
        console.error('Failed to fetch invite code', err)
      }
    }
    fetchInviteCode()
  }, [currentUser])

  const { isInstallable, promptInstall } = useInstallPrompt()

  const walletIcons: Record<string, typeof Wallet> = {
    cash: Banknote,
    bank: CreditCard,
    ewallet: Smartphone,
  }

  const handleDeleteWallet = async (id: string) => {
    try {
      await deleteWallet(id)
      setDeletingId(null)
      refresh()
    } catch (err) {
      console.error('Failed to delete wallet:', err)
    }
  }

  const openEditBalance = (wallet: WalletType) => {
    setEditingWallet(wallet)
  }

  const handleMenuClick = (label: string) => {
    if (label === 'AI Advisor') setIsAdvisorOpen(true)
    else if (label === 'Notifications' || label === 'Security' || label === 'Help & Support') {
      alert('Fitur ini sedang dalam pengembangan (Coming Soon) 🚀')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6 h-11">
          <h1 className="text-2xl font-bold text-text">Profile</h1>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
              {currentUser?.avatarInitials || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-text">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-text-muted">{currentUser?.email || 'user@aicount.app'}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary">
                {currentUser?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Settings size={18} className="text-text-secondary" />
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary mb-1">Total Assets</p>
            <p className="text-3xl font-extrabold text-text">Rp {formatCurrency(totalBalance)}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary">Family Invite Code</p>
              <p className="text-sm font-bold text-primary tracking-widest">{inviteCode || '------'}</p>
            </div>
            <button
              onClick={() => {
                if (inviteCode) {
                  navigator.clipboard.writeText(inviteCode)
                  alert('Invite code copied!')
                }
              }}
              className="px-3 py-1.5 bg-primary-50 text-primary text-xs font-bold rounded-lg hover:bg-primary-100 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">My Wallets</h2>
          <button
            onClick={() => setShowAddWallet(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        <div className="space-y-2.5">
          {wallets.map((wallet) => {
            const WalletIcon = walletIcons[wallet.type] || Wallet
            const provider = [...bankOptions, ...ewalletOptions].find(p => wallet.name.includes(p.name))

            return (
              <div key={wallet.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 opacity-5" style={{ backgroundColor: wallet.color, filter: 'blur(20px)' }} />

                <div className="flex items-start justify-between z-10">
                  <div className="flex items-center gap-3">
                    {provider ? (
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                        <img src={provider.logo.replace(/^public\//, '/')} alt={provider.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (wallet.color || '#2A9D8F') + '15' }}
                      >
                        <WalletIcon size={20} style={{ color: wallet.color || '#2A9D8F' }} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-text truncate">{wallet.name}</p>
                      <p className="text-[11px] font-medium text-text-muted capitalize">{wallet.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditBalance(wallet)}
                      className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                      title="Edit Balance"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingId(wallet.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete Wallet"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-1 z-10">
                  <p className="text-[11px] font-semibold text-text-muted mb-0.5 uppercase tracking-wider">Balance</p>
                  <p className={`text-xl font-extrabold ${wallet.balance >= 0 ? 'text-text' : 'text-red-500'}`}>
                    Rp {formatCurrency(wallet.balance)}
                  </p>
                </div>
              </div>
            )
          })}

          {wallets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">💳</p>
              <p className="text-sm text-text-muted">No wallets yet</p>
              <p className="text-xs text-text-muted mt-1">Tap "Add" to create your first wallet</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 mt-6">
        <h2 className="text-base font-bold text-text mb-3">Settings</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              disabled={item.disabled}
              onClick={() => handleMenuClick(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''
                } ${item.disabled ? 'opacity-40' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <item.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          ))}
        </div>
      </div>

      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="px-5 mt-4">
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-bold text-primary">Install Aicount App</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Get faster access & native feel</p>
            </div>
            <button 
              onClick={promptInstall}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-5 mt-4 mb-8">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>



      {/* ═══════════════════════════════════════ */}
      {/* DELETE CONFIRM MODAL */}
      {/* ═══════════════════════════════════════ */}
      <DestructiveModal
        isOpen={!!deletingId}
        title="Delete Wallet?"
        description="All transactions linked to this wallet will also be removed. This action cannot be undone."
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDeleteWallet(deletingId)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Wallet Modals */}
      <AddWalletModal isOpen={showAddWallet} onClose={() => setShowAddWallet(false)} onSuccess={refresh} />
      <EditBalanceModal wallet={editingWallet} onClose={() => setEditingWallet(null)} onSuccess={refresh} />

      {/* Profile & Settings Modals */}
      <EditProfileModal user={currentUser} isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} onSuccess={refreshUser} />
      <AIAdvisor isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
    </div>
  )
}
