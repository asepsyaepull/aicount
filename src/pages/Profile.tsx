import { Bell, CircleHelp, LogOut, Moon, Pencil, Plus, Settings, Shield, Trash2, Banknote, CreditCard, Smartphone, ChevronRight, Wallet, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '../hooks/useUser'
import { deleteWallet, useWallets, type Wallet as WalletType } from '../hooks/useWallets'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/currency'
import { AddWalletModal } from '../components/wallet/AddWalletModal'
import { EditBalanceModal } from '../components/wallet/EditBalanceModal'
import { bankOptions, ewalletOptions } from '../constants/wallet'

const menuItems = [
  { icon: Bell, label: 'Notifications', subtitle: 'Manage alerts' },
  { icon: Shield, label: 'Security', subtitle: 'Password & biometrics' },
  { icon: Moon, label: 'Dark Mode', subtitle: 'Coming soon', disabled: true },
  { icon: Sparkles, label: 'AI Advisor', subtitle: 'Get financial tips' },
  { icon: CircleHelp, label: 'Help & Support', subtitle: 'FAQ & Contact' },
]



export function ProfilePage() {
  const currentUser = useCurrentUser()
  const { wallets, totalBalance } = useWallets()

  // Modal States
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

  const walletIcons: Record<string, typeof Wallet> = {
    cash: Banknote,
    bank: CreditCard,
    ewallet: Smartphone,
  }

  const handleDeleteWallet = async (id: string) => {
    try {
      await deleteWallet(id)
      setDeletingId(null)
    } catch (err) {
      console.error('Failed to delete wallet:', err)
    }
  }

  const openEditBalance = (wallet: WalletType) => {
    setEditingWallet(wallet)
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
            <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
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
              <div key={wallet.id} className="relative rounded-xl overflow-hidden shadow-sm border border-gray-50 bg-gray-50/50">
                <div className="relative flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* Main Card (100% width) */}
                  <div className="w-full shrink-0 snap-center bg-white flex items-center gap-3 p-3.5 border-transparent">
                    {provider ? (
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-1.5 shadow-sm">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{wallet.name}</p>
                      <p className="text-[11px] text-text-muted capitalize">{wallet.type}</p>
                    </div>
                    <p className={`text-sm font-bold mr-1 ${wallet.balance >= 0 ? 'text-text' : 'text-red-500'}`}>
                      Rp {formatCurrency(wallet.balance)}
                    </p>
                  </div>

                  {/* Accessible Actions Layer at the end of scroll */}
                  <div className="shrink-0 snap-end flex items-center gap-1.5 px-3 bg-gray-50/50 border-l border-gray-100">
                    <button
                      onClick={() => openEditBalance(wallet)}
                      className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center active:bg-primary-200 transition-colors"
                    >
                      <Pencil size={14} className="text-primary-700" />
                    </button>
                    <button
                      onClick={() => setDeletingId(wallet.id)}
                      className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center active:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
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
      {deletingId && (
        <>
          <div className="fixed inset-0 z-60 overlay" onClick={() => setDeletingId(null)} />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl p-5 animate-fade-in">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-text">Delete Wallet?</h3>
                <p className="text-sm text-text-muted mt-1">
                  All transactions linked to this wallet will also be removed. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-text font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteWallet(deletingId)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Wallet Modals */}
      <AddWalletModal isOpen={showAddWallet} onClose={() => setShowAddWallet(false)} />
      <EditBalanceModal wallet={editingWallet} onClose={() => setEditingWallet(null)} />
    </div>
  )
}
