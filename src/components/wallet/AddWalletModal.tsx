import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { walletTypes, walletColors, bankOptions, ewalletOptions } from '../../constants/wallet'
import { addWallet } from '../../hooks/useWallets'
import { useAppStore } from '../../stores/appStore'
import { formatInputCurrency, parseCurrency } from '../../utils/currency'
import { useModalAnimation } from '../../hooks/useModalAnimation'

interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddWalletModal({ isOpen, onClose, onSuccess }: AddWalletModalProps) {
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'cash' | 'bank' | 'ewallet'>('cash')
  const [newBalance, setNewBalance] = useState('')
  const [newColor, setNewColor] = useState('#2A9D8F')
  const [saving, setSaving] = useState(false)

  const { shouldRender, isClosing } = useModalAnimation(isOpen)

  if (!shouldRender) return null

  const handleAddWallet = async () => {
    if (!newName || !currentFamilyId) return
    setSaving(true)
    try {
      await addWallet({
        familyId: currentFamilyId,
        name: newName,
        type: newType,
        balance: parseCurrency(newBalance) || 0,
        color: newColor,
      })
      onSuccess?.()
      onClose()
      setNewName('')
      setNewBalance('')
      setNewType('cash')
      setNewColor('#2A9D8F')
    } catch (err) {
      console.error('Failed to add wallet:', err)
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className={`fixed inset-0 z-60 overlay ${isClosing ? 'animate-fade-out' : ''}`} onClick={onClose} />
      <div className={`fixed inset-x-0 bottom-0 z-70 ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Add Wallet</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Wallet Name</label>
              <input
                type="text"
                placeholder="e.g. BCA Savings"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {walletTypes.map((wt) => (
                  <button
                    key={wt.value}
                    onClick={() => setNewType(wt.value as typeof newType)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      newType === wt.value
                        ? 'border-primary bg-primary-50'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{wt.icon}</span>
                    <span className="text-[10px] font-medium text-text-secondary">{wt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bank / E-Wallet Selection List */}
            {(newType === 'bank' || newType === 'ewallet') && (
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">
                  Choose {newType === 'bank' ? 'Bank' : 'E-Wallet'}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                  {(newType === 'bank' ? bankOptions : ewalletOptions).map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        if (
                          !newName ||
                          newName === 'BCA' ||
                          newName === 'GoPay' ||
                          bankOptions.some((b) => b.name === newName) ||
                          ewalletOptions.some((e) => e.name === newName)
                        ) {
                          setNewName(provider.name)
                        }
                        setNewColor(provider.color)
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border-2 transition-all ${
                        newColor === provider.color && newName.includes(provider.name)
                          ? 'border-primary bg-primary-50'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-white rounded shrink-0">
                        <img src={provider.logo} alt={provider.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-semibold text-text truncate">{provider.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Initial Balance */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Initial Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={newBalance}
                  onChange={(e) => setNewBalance(formatInputCurrency(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-lg font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Color</label>
              <div className="flex gap-2">
                {walletColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      newColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAddWallet}
              disabled={!newName || saving}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Wallet'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
