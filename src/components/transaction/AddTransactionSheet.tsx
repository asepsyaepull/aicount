import { Camera, Loader2, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { addTransaction } from '../../hooks/useTransactions'
import { useWallets } from '../../hooks/useWallets'
import { parseReceiptImage, parseSmartInput } from '../../lib/gemini'
import { useAppStore } from '../../stores/appStore'
import { formatInputCurrency, parseCurrency } from '../../utils/currency'
import { SegmentedControl } from '../ui/SegmentedControl'

export function AddTransactionSheet() {
  const isOpen = useAppStore((s) => s.isAddTransactionOpen)
  const close = useAppStore((s) => s.closeAddTransaction)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [smartInput, setSmartInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const { wallets } = useWallets()
  const allCategories = useCategories()
  const categories = allCategories.filter((cat) => cat.type === (type === 'transfer' ? 'expense' : type))
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set defaults
  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id)
    }
  }, [wallets, walletId])

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  // Reset when type changes
  useEffect(() => {
    setCategoryId('')
  }, [type])

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setAmount(formatInputCurrency(raw))
  }, [])

  const handleSmartInputSubmit = async () => {
    if (!smartInput.trim() || isAiLoading) return
    setIsAiLoading(true)
    try {
      const data = await parseSmartInput(smartInput)

      // Apply data
      if (data.type === 'expense' || data.type === 'income' || data.type === 'transfer') {
        setType(data.type as 'expense' | 'income' | 'transfer')
      }

      if (data.amount) setAmount(formatInputCurrency(data.amount.toString()))
      if (data.note) setNote(data.note)

      // Find best category match
      if (data.categoryName) {
        const lowerCat = data.categoryName.toLowerCase()
        const matchedCat = allCategories.find((c) =>
          c.name.toLowerCase().includes(lowerCat) || lowerCat.includes(c.name.toLowerCase())
        )
        if (matchedCat) setCategoryId(matchedCat.id)
      }

      // Find best wallet match
      if (data.walletName) {
        const lowerWallet = data.walletName.toLowerCase()
        const matchedWallet = wallets.find((w) =>
          w.name.toLowerCase().includes(lowerWallet) || lowerWallet.includes(w.name.toLowerCase())
        )
        if (matchedWallet) setWalletId(matchedWallet.id)
      }

      setSmartInput('') // clear input after success
    } catch (err) {
      console.error(err)
      alert('Gagal memproses input menggunakan AI.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAiLoading(true)
    try {
      // Baca file jadi base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1] // Buang 'data:image/...;base64,' prefix
        const mimeType = file.type

        try {
          const data = await parseReceiptImage(base64Data, mimeType)

          if (data.type === 'expense') setType('expense')
          if (data.amount) setAmount(formatInputCurrency(data.amount.toString()))
          if (data.note) setNote(data.note)

          if (data.categoryName) {
            const lowerCat = data.categoryName.toLowerCase()
            const matchedCat = allCategories.find((c) =>
              c.name.toLowerCase().includes(lowerCat) || lowerCat.includes(c.name.toLowerCase())
            )
            if (matchedCat) setCategoryId(matchedCat.id)
          }
        } catch (parseErr) {
          console.error(parseErr)
          alert('Gagal mengekstrak data dari struk.')
        } finally {
          setIsAiLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      setIsAiLoading(false)
      alert('Gagal membaca gambar.')
    }
  }

  const handleSave = async () => {
    if (!amount || !walletId || !currentUserId || !currentFamilyId) return
    setSaving(true)

    try {
      await addTransaction({
        familyId: currentFamilyId,
        createdBy: currentUserId,
        walletId,
        categoryId: categoryId || 'cat-other-expense',
        amount: parseCurrency(amount),
        type,
        date: new Date(date),
        note: note || '',
      })

      // Reset form
      setAmount('')
      setNote('')
      setSmartInput('')
      close()
    } catch (err) {
      console.error('Failed to save transaction:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-60 overlay" onClick={close} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-70 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-lg font-bold text-text">New Transaction</h2>
            <button
              onClick={close}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pb-6 space-y-4">
            {/* Segmented Control */}
            <SegmentedControl value={type} onChange={setType} />

            {/* Smart Input */}
            <div className="flex gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder='Try: "Makan siang 50rb" ...'
                  value={smartInput}
                  onChange={(e) => setSmartInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSmartInputSubmit()
                  }}
                  disabled={isAiLoading}
                  className="w-full pl-10 pr-12 py-3 bg-primary-50 rounded-xl text-sm border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
                />
                <Sparkles size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isAiLoading ? 'text-primary animate-pulse' : 'text-primary'}`} />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {smartInput.trim() && (
                    <button
                      onClick={handleSmartInputSubmit}
                      disabled={isAiLoading}
                      className="p-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors text-[10px] font-bold"
                    >
                      GO
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  // capture="environment" // Bisa di-uncomment jika ingin langsung buka kamera di HP
                  />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAiLoading}
                className="w-1/7 flex items-center justify-center p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                title="Scan Receipt"
              >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-xl font-bold text-text border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-gray-300"
                  id="amount-input"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${categoryId === cat.id
                        ? 'border-primary bg-primary-50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-text-secondary truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Wallet</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWalletId(w.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 whitespace-nowrap transition-all ${walletId === w.id
                        ? 'border-primary bg-primary-50'
                        : 'border-transparent bg-gray-50'
                      }`}
                  >
                    <span className="text-sm font-medium">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Note</label>
                <input
                  type="text"
                  placeholder="Add note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!amount || saving}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              id="save-transaction-btn"
            >
              {saving ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
