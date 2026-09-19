export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'Digital Wallet';

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string; // matches CategoryInfo.name or id
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  recurringBillId?: string;
  createdAt: number;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export type BillFrequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: BillFrequency;
  dueDay: number; // 1 to 31
  autoPay: boolean;
  notes?: string;
  lastPaidDate?: string; // YYYY-MM-DD
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string;
  notes?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}
