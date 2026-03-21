import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Banknote, CreditCard, Smartphone, Sparkles } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { addWallet } from '../hooks/useWallets'
import { addCategory } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'
import { formatInputCurrency, parseCurrency } from '../utils/currency'
import { bankOptions, ewalletOptions } from '../constants/wallet'

// ─── Default categories to offer ──────────────────────
const DEFAULT_CATEGORIES: { name: string; icon: string; type: 'expense' | 'income' }[] = [
  // Expense
  { name: 'Food', icon: '🍔', type: 'expense' },
  { name: 'Transport', icon: '🚗', type: 'expense' },
  { name: 'Shopping', icon: '🛒', type: 'expense' },
  { name: 'Bills', icon: '💡', type: 'expense' },
  { name: 'Health', icon: '💊', type: 'expense' },
  { name: 'Education', icon: '🎓', type: 'expense' },
  { name: 'Entertainment', icon: '🎮', type: 'expense' },
  { name: 'Housing', icon: '🏠', type: 'expense' },
  { name: 'Fashion', icon: '👗', type: 'expense' },
  { name: 'Gift', icon: '🎁', type: 'expense' },
  { name: 'Travel', icon: '✈️', type: 'expense' },
  { name: 'Pet', icon: '🐶', type: 'expense' },
  // Income
  { name: 'Salary', icon: '💰', type: 'income' },
  { name: 'Freelance', icon: '💼', type: 'income' },
  { name: 'Investment', icon: '📈', type: 'income' },
  { name: 'Business', icon: '🏦', type: 'income' },
  { name: 'Bonus', icon: '🎉', type: 'income' },
  { name: 'Other', icon: '📦', type: 'income' },
]

// ─── Wallet choices ────────────────────────────────────
interface WalletChoice {
  id: string
  name: string
  type: 'cash' | 'bank' | 'ewallet'
  color: string
  logo?: string
}

const cashWallet: WalletChoice = { id: 'cash', name: 'Cash', type: 'cash', color: '#2A9D8F' }

const bankChoices: WalletChoice[] = bankOptions.map(b => ({
  id: b.id,
  name: b.name,
  type: 'bank' as const,
  color: b.color,
  logo: b.logo,
}))

const ewalletChoices: WalletChoice[] = ewalletOptions.map(e => ({
  id: e.id,
  name: e.name,
  type: 'ewallet' as const,
  color: e.color,
  logo: e.logo,
}))

const STEPS = ['Select Wallets', 'Set Balance', 'Choose Categories']

export function OnboardingPage() {
  const familyId = useAppStore((s) => s.currentFamilyId)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 1: selected wallet IDs
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<string>>(new Set())

  // Step 2: balances per wallet id
  const [balances, setBalances] = useState<Record<string, string>>({})

  // Step 3: selected category indices
  const [selectedCatIndices, setSelectedCatIndices] = useState<Set<number>>(
    new Set(DEFAULT_CATEGORIES.map((_, i) => i)) // all selected by default
  )

  // ─── Helpers ────────────────────────────────────────
  const allWalletChoices = [cashWallet, ...bankChoices, ...ewalletChoices]
  const selectedWallets = allWalletChoices.filter(w => selectedWalletIds.has(w.id))

  const toggleWallet = (id: string) => {
    setSelectedWalletIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCategory = (idx: number) => {
    setSelectedCatIndices(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleBalanceChange = (walletId: string, raw: string) => {
    setBalances(prev => ({ ...prev, [walletId]: formatInputCurrency(raw) }))
  }

  const canProceed = () => {
    if (step === 0) return selectedWalletIds.size > 0
    if (step === 1) return true // balance is optional (default 0)
    if (step === 2) return selectedCatIndices.size > 0
    return false
  }

  // ─── Final save ─────────────────────────────────────
  const handleFinish = async () => {
    if (!familyId) return
    setSaving(true)
    try {
      // Clean up any auto-created data (from DB triggers) to avoid duplicates
      await supabase.from('wallets').delete().eq('family_id', familyId)
      await supabase.from('categories').delete().eq('family_id', familyId)

      // Save wallets
      for (const w of selectedWallets) {
        await addWallet({
          familyId,
          name: w.name,
          type: w.type,
          balance: parseCurrency(balances[w.id] || '0'),
          color: w.color,
        })
      }

      // Save categories
      for (const idx of selectedCatIndices) {
        const cat = DEFAULT_CATEGORIES[idx]
        await addCategory({
          familyId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
        })
      }

      // Mark onboarding as complete
      const userId = useAppStore.getState().currentUserId
      if (userId) {
        localStorage.setItem(`aicount_onboarded_${userId}`, 'true')
      }

      // Force full reload so App.tsx re-checks and clears needsOnboarding
      window.location.href = '/'
    } catch (err) {
      console.error('Onboarding failed:', err)
      alert('Gagal menyimpan setup. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Render helpers per step ────────────────────────
  const renderStep0 = () => (
    <div className="space-y-5 animate-fade-in">
      {/* Cash */}
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 ml-1">Cash</p>
        <button
          onClick={() => toggleWallet(cashWallet.id)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
            selectedWalletIds.has(cashWallet.id) ? 'border-primary bg-primary-50 shadow-sm' : 'border-gray-100 bg-white'
          }`}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cashWallet.color + '20' }}>
            <Banknote size={20} style={{ color: cashWallet.color }} />
          </div>
          <span className="text-sm font-semibold text-text flex-1 text-left">Cash</span>
          {selectedWalletIds.has(cashWallet.id) && (
            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Banks */}
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 ml-1">Bank</p>
        <div className="grid grid-cols-2 gap-2">
          {bankChoices.map(b => (
            <button
              key={b.id}
              onClick={() => toggleWallet(b.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                selectedWalletIds.has(b.id) ? 'border-primary bg-primary-50 shadow-sm' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 p-1 shrink-0">
                <img src={b.logo?.replace(/^public\//, '/')} alt={b.name} className="max-h-full max-w-full object-contain" />
              </div>
              <span className="text-xs font-semibold text-text truncate flex-1 text-left">{b.name}</span>
              {selectedWalletIds.has(b.id) && (
                <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* E-Wallets */}
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 ml-1">E-Wallet</p>
        <div className="grid grid-cols-2 gap-2">
          {ewalletChoices.map(e => (
            <button
              key={e.id}
              onClick={() => toggleWallet(e.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                selectedWalletIds.has(e.id) ? 'border-primary bg-primary-50 shadow-sm' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 p-1 shrink-0">
                <img src={e.logo?.replace(/^public\//, '/')} alt={e.name} className="max-h-full max-w-full object-contain" />
              </div>
              <span className="text-xs font-semibold text-text truncate flex-1 text-left">{e.name}</span>
              {selectedWalletIds.has(e.id) && (
                <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-3 animate-fade-in">
      {selectedWallets.map(w => {
        const WIcon = w.type === 'cash' ? Banknote : w.type === 'bank' ? CreditCard : Smartphone
        return (
          <div key={w.id} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2.5">
            <div className="flex items-center gap-3">
              {w.logo ? (
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-gray-100 p-1 shrink-0">
                  <img src={w.logo.replace(/^public\//, '/')} alt={w.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: w.color + '20' }}>
                  <WIcon size={18} style={{ color: w.color }} />
                </div>
              )}
              <span className="text-sm font-bold text-text">{w.name}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
              <input
                inputMode="numeric"
                type="text"
                placeholder="0"
                value={balances[w.id] || ''}
                onChange={(e) => handleBalanceChange(w.id, e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-lg font-bold text-text border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-gray-300"
              />
            </div>
          </div>
        )
      })}
      {selectedWallets.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          Pilih wallet dulu di step sebelumnya.
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      {/* Expense */}
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 ml-1">Expense</p>
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_CATEGORIES.map((cat, i) => {
            if (cat.type !== 'expense') return null
            const selected = selectedCatIndices.has(i)
            return (
              <button
                key={i}
                onClick={() => toggleCategory(i)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selected ? 'border-primary bg-primary-50 shadow-sm' : 'border-gray-100 bg-white opacity-60'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-semibold text-text-secondary truncate w-full text-center">{cat.name}</span>
                {selected && (
                  <div className="w-4 h-4 rounded-full gradient-primary flex items-center justify-center">
                    <Check size={8} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Income */}
      <div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5 ml-1">Income</p>
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_CATEGORIES.map((cat, i) => {
            if (cat.type !== 'income') return null
            const selected = selectedCatIndices.has(i)
            return (
              <button
                key={i}
                onClick={() => toggleCategory(i)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selected ? 'border-primary bg-primary-50 shadow-sm' : 'border-gray-100 bg-white opacity-60'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-semibold text-text-secondary truncate w-full text-center">{cat.name}</span>
                {selected && (
                  <div className="w-4 h-4 rounded-full gradient-primary flex items-center justify-center">
                    <Check size={8} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ─── Main layout ────────────────────────────────────
  const stepTitles = ['Which wallets do you use?', 'Set your initial balance', 'Pick your categories']
  const stepSubtitles = [
    'Select all wallets you want to track.',
    'Enter the current balance for each wallet.',
    'Choose the spending & income categories that fit your lifestyle.',
  ]

  return (
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-bg relative overflow-hidden sm:shadow-2xl sm:border-x sm:border-gray-50">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-8 rounded-b-3xl text-center shrink-0">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Sparkles size={20} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-1">{stepTitles[step]}</h1>
        <p className="text-white/70 text-xs">{stepSubtitles[step]}</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-6 px-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                i <= step ? 'gradient-primary shadow-sm' : 'bg-white/20'
              }`} />
              <span className={`text-[9px] font-semibold transition-colors ${
                i <= step ? 'text-white' : 'text-white/40'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-5 overflow-y-auto pb-32">
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-5 py-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-5 py-3 rounded-xl bg-gray-100 text-text font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          
          <button
            onClick={() => {
              if (step < 2) setStep(s => s + 1)
              else handleFinish()
            }}
            disabled={!canProceed() || saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : step < 2 ? (
              <>Next <ChevronRight size={16} /></>
            ) : (
              <>Finish Setup <Check size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
