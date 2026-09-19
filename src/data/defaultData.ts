import { CategoryInfo, Currency, RecurringBill, SavingsGoal, Transaction, Budget } from '../types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
];

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food & Dining', color: '#f97316', bgColor: '#ffedd5', icon: 'Utensils', type: 'expense' },
  { id: 'groceries', name: 'Groceries', color: '#10b981', bgColor: '#d1fae5', icon: 'ShoppingCart', type: 'expense' },
  { id: 'housing', name: 'Housing & Rent', color: '#3b82f6', bgColor: '#dbeafe', icon: 'Home', type: 'expense' },
  { id: 'transport', name: 'Transportation', color: '#8b5cf6', bgColor: '#ede9fe', icon: 'Car', type: 'expense' },
  { id: 'utilities', name: 'Utilities & Bills', color: '#06b6d4', bgColor: '#cffafe', icon: 'Zap', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', color: '#ec4899', bgColor: '#fce7f3', icon: 'Film', type: 'expense' },
  { id: 'healthcare', name: 'Health & Medical', color: '#ef4444', bgColor: '#fee2e2', icon: 'HeartPulse', type: 'expense' },
  { id: 'shopping', name: 'Shopping & Apparel', color: '#f59e0b', bgColor: '#fef3c7', icon: 'ShoppingBag', type: 'expense' },
  { id: 'personal', name: 'Personal Care', color: '#14b8a6', bgColor: '#ccfbf1', icon: 'Sparkles', type: 'expense' },
  { id: 'education', name: 'Education & Work', color: '#6366f1', bgColor: '#e0e7ff', icon: 'BookOpen', type: 'expense' },
  { id: 'other_exp', name: 'Other Expenses', color: '#64748b', bgColor: '#f1f5f9', icon: 'CircleEllipsis', type: 'expense' },

  // Income categories
  { id: 'salary', name: 'Salary & Wages', color: '#10b981', bgColor: '#d1fae5', icon: 'Briefcase', type: 'income' },
  { id: 'freelance', name: 'Freelance & Side Gig', color: '#3b82f6', bgColor: '#dbeafe', icon: 'Laptop', type: 'income' },
  { id: 'investment', name: 'Investment Returns', color: '#8b5cf6', bgColor: '#ede9fe', icon: 'TrendingUp', type: 'income' },
  { id: 'other_inc', name: 'Other Income', color: '#059669', bgColor: '#d1fae5', icon: 'PlusCircle', type: 'income' },
];

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'Digital Wallet',
] as const;

// Helper to format date offset from today
const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const getCurrentMonthStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getDefaultTransactions = (): Transaction[] => {
  return [
    {
      id: 'tx-1',
      type: 'income',
      title: 'Monthly Salary Deposit',
      amount: 4200.00,
      category: 'Salary & Wages',
      date: getRelativeDateStr(18),
      paymentMethod: 'Bank Transfer',
      notes: 'Direct deposit from employer',
      createdAt: Date.now() - 18 * 86400000,
    },
    {
      id: 'tx-2',
      type: 'expense',
      title: 'Apartment Monthly Rent',
      amount: 1450.00,
      category: 'Housing & Rent',
      date: getRelativeDateStr(18),
      paymentMethod: 'Bank Transfer',
      notes: 'Auto-debit for unit #402',
      recurringBillId: 'bill-1',
      createdAt: Date.now() - 18 * 86400000 + 1000,
    },
    {
      id: 'tx-3',
      type: 'expense',
      title: 'Weekly Organic Grocery Run',
      amount: 118.45,
      category: 'Groceries',
      date: getRelativeDateStr(0),
      paymentMethod: 'Credit Card',
      notes: 'Whole Foods Market - fresh produce and pantry goods',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'tx-4',
      type: 'expense',
      title: 'Artisan Coffee & Breakfast',
      amount: 14.80,
      category: 'Food & Dining',
      date: getRelativeDateStr(0),
      paymentMethod: 'Digital Wallet',
      notes: 'Oat latte & almond croissant',
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      title: 'Metro Transit Monthly Pass',
      amount: 85.00,
      category: 'Transportation',
      date: getRelativeDateStr(1),
      paymentMethod: 'Credit Card',
      notes: 'Commuter subways & buses',
      createdAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'tx-6',
      type: 'expense',
      title: 'Dinner with Colleagues',
      amount: 68.50,
      category: 'Food & Dining',
      date: getRelativeDateStr(2),
      paymentMethod: 'Credit Card',
      notes: 'Italian Bistro downtown',
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'tx-7',
      type: 'expense',
      title: 'High-Speed Fiber Internet',
      amount: 65.00,
      category: 'Utilities & Bills',
      date: getRelativeDateStr(4),
      paymentMethod: 'Debit Card',
      notes: 'Monthly Gigabit internet bill',
      recurringBillId: 'bill-2',
      createdAt: Date.now() - 4 * 86400000,
    },
    {
      id: 'tx-8',
      type: 'income',
      title: 'Freelance UI Design Milestone',
      amount: 650.00,
      category: 'Freelance & Side Gig',
      date: getRelativeDateStr(5),
      paymentMethod: 'Digital Wallet',
      notes: 'Client landing page refresh project',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx-9',
      type: 'expense',
      title: 'Supermarket Restock',
      amount: 92.15,
      category: 'Groceries',
      date: getRelativeDateStr(6),
      paymentMethod: 'Debit Card',
      notes: 'Household essentials & snacks',
      createdAt: Date.now() - 6 * 86400000,
    },
    {
      id: 'tx-10',
      type: 'expense',
      title: 'Cinema & Popcorn',
      amount: 32.00,
      category: 'Entertainment',
      date: getRelativeDateStr(8),
      paymentMethod: 'Cash',
      notes: 'Weekend evening movie ticket',
      createdAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx-11',
      type: 'expense',
      title: 'Running Shoes & Socks',
      amount: 110.00,
      category: 'Shopping & Apparel',
      date: getRelativeDateStr(10),
      paymentMethod: 'Credit Card',
      notes: 'Sale discount on training shoes',
      createdAt: Date.now() - 10 * 86400000,
    },
    {
      id: 'tx-12',
      type: 'expense',
      title: 'Pharmacy Vitamins & Supplements',
      amount: 34.50,
      category: 'Health & Medical',
      date: getRelativeDateStr(12),
      paymentMethod: 'Credit Card',
      notes: 'Vitamin D & Omega 3',
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-13',
      type: 'expense',
      title: 'Electricity & Gas Utility',
      amount: 78.40,
      category: 'Utilities & Bills',
      date: getRelativeDateStr(14),
      paymentMethod: 'Bank Transfer',
      notes: 'City power bill',
      recurringBillId: 'bill-3',
      createdAt: Date.now() - 14 * 86400000,
    },
  ];
};

export const getDefaultBudgets = (): Budget[] => {
  const currentMonth = getCurrentMonthStr();
  return [
    { id: 'b-1', category: 'Housing & Rent', monthlyLimit: 1500, month: currentMonth },
    { id: 'b-2', category: 'Groceries', monthlyLimit: 450, month: currentMonth },
    { id: 'b-3', category: 'Food & Dining', monthlyLimit: 300, month: currentMonth },
    { id: 'b-4', category: 'Transportation', monthlyLimit: 200, month: currentMonth },
    { id: 'b-5', category: 'Utilities & Bills', monthlyLimit: 250, month: currentMonth },
    { id: 'b-6', category: 'Entertainment', monthlyLimit: 150, month: currentMonth },
    { id: 'b-7', category: 'Shopping & Apparel', monthlyLimit: 200, month: currentMonth },
    { id: 'b-8', category: 'Health & Medical', monthlyLimit: 120, month: currentMonth },
  ];
};

export const getDefaultRecurringBills = (): RecurringBill[] => {
  const currentDay = new Date().getDate();
  return [
    {
      id: 'bill-1',
      name: 'Apartment Rent',
      amount: 1450.00,
      category: 'Housing & Rent',
      frequency: 'monthly',
      dueDay: 1,
      autoPay: true,
      notes: 'Landlord direct bank transfer',
      lastPaidDate: getRelativeDateStr(18),
    },
    {
      id: 'bill-2',
      name: 'Fiber Gigabit Internet',
      amount: 65.00,
      category: 'Utilities & Bills',
      frequency: 'monthly',
      dueDay: 15,
      autoPay: true,
      notes: 'Provider auto debit',
      lastPaidDate: getRelativeDateStr(4),
    },
    {
      id: 'bill-3',
      name: 'Electric & Gas Utility',
      amount: 85.00,
      category: 'Utilities & Bills',
      frequency: 'monthly',
      dueDay: 22,
      autoPay: false,
      notes: 'Review usage invoice online',
    },
    {
      id: 'bill-4',
      name: 'Cloud Storage & Productivity Suite',
      amount: 19.99,
      category: 'Education & Work',
      frequency: 'monthly',
      dueDay: (currentDay + 3) % 28 || 28,
      autoPay: true,
      notes: 'Annual subscription billed monthly',
    },
    {
      id: 'bill-5',
      name: 'Fitness Gym Membership',
      amount: 45.00,
      category: 'Health & Medical',
      frequency: 'monthly',
      dueDay: (currentDay + 6) % 28 || 28,
      autoPay: true,
      notes: 'Full club access pass',
    },
    {
      id: 'bill-6',
      name: 'Video Streaming Ultra HD',
      amount: 15.99,
      category: 'Entertainment',
      frequency: 'monthly',
      dueDay: (currentDay + 11) % 28 || 28,
      autoPay: true,
      notes: 'Family entertainment tier',
    }
  ];
};

export const getDefaultSavingsGoals = (): SavingsGoal[] => {
  const d = new Date();
  const nextYear = d.getFullYear() + 1;
  return [
    {
      id: 'goal-1',
      name: '6-Month Emergency Safety Fund',
      targetAmount: 10000.00,
      currentAmount: 7450.00,
      targetDate: `${nextYear}-06-30`,
      category: 'Security',
      color: '#10b981',
      notes: 'High-yield savings account for unexpected events',
    },
    {
      id: 'goal-2',
      name: 'Autumn Japan Vacation',
      targetAmount: 3500.00,
      currentAmount: 2280.00,
      targetDate: `${d.getFullYear()}-11-15`,
      category: 'Travel',
      color: '#3b82f6',
      notes: 'Flights, Ryokan stays, bullet train pass and ramen fund',
    },
    {
      id: 'goal-3',
      name: 'Pro Laptop Workstation',
      targetAmount: 2400.00,
      currentAmount: 1950.00,
      targetDate: `${d.getFullYear()}-12-20`,
      category: 'Technology',
      color: '#8b5cf6',
      notes: 'High-performance laptop for design and coding',
    }
  ];
};
