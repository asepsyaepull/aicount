import { useState, useEffect } from 'react'
import { X, Wallet, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { updateWallet, type Wallet as WalletType } from '../../hooks/useWallets'
import { bankOptions, ewalletOptions } from '../../constants/wallet'
import { formatCurrency, formatInputCurrency, parseCurrency } from '../../utils/currency'

interface EditBalanceModalProps {
  wallet: WalletType | null
  onClose: () => void
}

const walletIcons: Record<string, typeof Wallet> = {
  cash: Banknote,
  bank: CreditCard,
  ewallet: Smartphone,
}

export function EditBalanceModal({ wallet, onClose }: EditBalanceModalProps) {
  const [editBalance, setEditBalance] = useState('')
  const [saving, setSaving] = useState(false)

  // Initialize form when a wallet is passed
  useEffect(() => {
    if (wallet) {
      setEditBalance(wallet.balance.toString())
    }
  }, [wallet])

  if (!wallet) return null

  const handleUpdateBalance = async () => {
    setSaving(true)
    try {
      await updateWallet(wallet.id, { balance: parseCurrency(editBalance) })
      onClose()
    } catch (err) {
      console.error('Failed to update balance:', err)
    } finally {
      setSaving(false)
    }
  }

  const provider = [...bankOptions, ...ewalletOptions].find((p) => wallet.name.includes(p.name))
  const Icon = walletIcons[wallet.type] || Wallet

  return (
    <>
      <div className="fixed inset-0 z-60 overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-70 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Edit Balance</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              {provider ? (
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-1.5 shadow-sm">
                  <img
                    src={provider.logo.replace(/^public\//, '/')}
                    alt={provider.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (wallet.color || '#2A9D8F') + '15' }}
                >
                  <Icon size={20} style={{ color: wallet.color || '#2A9D8F' }} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-text">{wallet.name}</p>
                <p className="text-[11px] text-text-muted">Current: Rp {formatCurrency(wallet.balance)}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">New Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={editBalance}
                  onChange={(e) => setEditBalance(formatInputCurrency(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-lg font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateBalance}
              disabled={saving || !editBalance}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Balance'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
