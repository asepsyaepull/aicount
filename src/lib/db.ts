import Dexie, { type EntityTable } from 'dexie'

export interface User {
  id: string
  familyId: string
  name: string
  email: string
  role: 'admin' | 'member'
  avatarInitials?: string
  createdAt: Date
}

export interface Wallet {
  id: string
  familyId: string
  name: string
  type: 'bank' | 'cash' | 'ewallet'
  balance: number
  icon?: string
  color?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense'
}

export interface Transaction {
  id: string
  familyId: string
  userId: string
  walletId: string
  categoryId: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  date: Date
  note?: string
  merchantName?: string
}

export interface Budget {
  id: string
  familyId: string
  categoryId: string
  amountLimit: number
  monthYear: string // 'MM-YYYY'
}

class AicountDB extends Dexie {
  users!: EntityTable<User, 'id'>
  wallets!: EntityTable<Wallet, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  budgets!: EntityTable<Budget, 'id'>

  constructor() {
    super('AicountDB')
    this.version(1).stores({
      users: 'id, familyId, email',
      wallets: 'id, familyId',
      categories: 'id, type',
      transactions: 'id, familyId, userId, walletId, categoryId, type, date',
      budgets: 'id, familyId, categoryId, monthYear',
    })
  }
}

export const db = new AicountDB()

// Default categories
const defaultCategories: Category[] = [
  { id: 'cat-groceries', name: 'Groceries', icon: '🛒', type: 'expense' },
  { id: 'cat-food', name: 'Food', icon: '🍔', type: 'expense' },
  { id: 'cat-transport', name: 'Transport', icon: '🚗', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', type: 'expense' },
  { id: 'cat-bills', name: 'Bills', icon: '📄', type: 'expense' },
  { id: 'cat-health', name: 'Health', icon: '🏥', type: 'expense' },
  { id: 'cat-education', name: 'Education', icon: '📚', type: 'expense' },
  { id: 'cat-housing', name: 'Housing', icon: '🏠', type: 'expense' },
  { id: 'cat-personal', name: 'Personal', icon: '👤', type: 'expense' },
  { id: 'cat-salary', name: 'Salary', icon: '💰', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'cat-investment', name: 'Investment', icon: '📈', type: 'income' },
  { id: 'cat-gift', name: 'Gift', icon: '🎁', type: 'income' },
  { id: 'cat-other-income', name: 'Other', icon: '💵', type: 'income' },
  { id: 'cat-other-expense', name: 'Other', icon: '📦', type: 'expense' },
]

export async function seedDatabase() {
  const categoryCount = await db.categories.count()
  if (categoryCount === 0) {
    await db.categories.bulkAdd(defaultCategories)
  }

  const userCount = await db.users.count()
  if (userCount === 0) {
    const familyId = crypto.randomUUID()
    const user: User = {
      id: crypto.randomUUID(),
      familyId,
      name: 'User',
      email: 'user@aicount.app',
      role: 'admin',
      avatarInitials: 'U',
      createdAt: new Date(),
    }
    await db.users.add(user)

    // Add default wallets
    await db.wallets.bulkAdd([
      {
        id: crypto.randomUUID(),
        familyId,
        name: 'Cash',
        type: 'cash',
        balance: 0,
        icon: '💵',
        color: '#2A9D8F',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        name: 'Bank BCA',
        type: 'bank',
        balance: 0,
        icon: '🏦',
        color: '#264653',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        name: 'GoPay',
        type: 'ewallet',
        balance: 0,
        icon: '📱',
        color: '#48BFA0',
      },
    ])

    // Add sample data
    const wallets = await db.wallets.where('familyId').equals(familyId).toArray()
    const now = new Date()
    const thisMonth = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`

    // Sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: crypto.randomUUID(),
        familyId,
        userId: user.id,
        walletId: wallets[0].id,
        categoryId: 'cat-salary',
        amount: 10000000,
        type: 'income',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        note: 'Monthly Salary',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        userId: user.id,
        walletId: wallets[0].id,
        categoryId: 'cat-groceries',
        amount: 850000,
        type: 'expense',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0),
        note: 'Monthly Shopping',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        userId: user.id,
        walletId: wallets[1].id,
        categoryId: 'cat-food',
        amount: 175000,
        type: 'expense',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30),
        note: 'Lunch at restaurant',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        userId: user.id,
        walletId: wallets[0].id,
        categoryId: 'cat-entertainment',
        amount: 50000,
        type: 'expense',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 15, 0),
        note: 'Monthly Videos Premium',
      },
      {
        id: crypto.randomUUID(),
        familyId,
        userId: user.id,
        walletId: wallets[2].id,
        categoryId: 'cat-transport',
        amount: 125000,
        type: 'expense',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 9, 0),
        note: 'Grab rides this week',
      },
    ]

    await db.transactions.bulkAdd(sampleTransactions)

    // Update wallet balances
    await db.wallets.update(wallets[0].id, { balance: 10000000 - 850000 - 50000 })
    await db.wallets.update(wallets[1].id, { balance: -175000 + 5000000 })
    await db.wallets.update(wallets[2].id, { balance: 2000000 - 125000 })

    // Sample budgets
    await db.budgets.bulkAdd([
      { id: crypto.randomUUID(), familyId, categoryId: 'cat-groceries', amountLimit: 2000000, monthYear: thisMonth },
      { id: crypto.randomUUID(), familyId, categoryId: 'cat-food', amountLimit: 1500000, monthYear: thisMonth },
      { id: crypto.randomUUID(), familyId, categoryId: 'cat-entertainment', amountLimit: 500000, monthYear: thisMonth },
      { id: crypto.randomUUID(), familyId, categoryId: 'cat-transport', amountLimit: 1000000, monthYear: thisMonth },
      { id: crypto.randomUUID(), familyId, categoryId: 'cat-shopping', amountLimit: 1000000, monthYear: thisMonth },
    ])
  }
}
