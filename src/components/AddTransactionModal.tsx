import React, { useState } from 'react';
import { X, Plus, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { Currency, PaymentMethod, Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/defaultData';
import { CategoryIcon } from './CategoryIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currency: Currency;
  initialType?: TransactionType;
  initialCategory?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  currency,
  initialType = 'expense',
  initialCategory,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(
    initialCategory || (initialType === 'expense' ? 'Food & Dining' : 'Salary & Wages')
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a description or merchant name');
      return;
    }

    onAddTransaction({
      type,
      title: title.trim(),
      amount: numAmount,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    // Reset & close
    setTitle('');
    setAmount('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-slate-900 text-white rounded-xl">
              <Plus size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-800">Add Transaction</h2>
          </div>
          <button
            id="close-transaction-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="type-expense-btn"
              onClick={() => {
                setType('expense');
                setCategory('Food & Dining');
              }}
              className={`flex items-center justify-center py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={16} className="mr-1.5 text-rose-500" />
              Expense
            </button>
            <button
              type="button"
              id="type-income-btn"
              onClick={() => {
                setType('income');
                setCategory('Salary & Wages');
              }}
              className={`flex items-center justify-center py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={16} className="mr-1.5 text-emerald-500" />
              Income
            </button>
          </div>

          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Amount
            </label>
            <div className="relative rounded-xl shadow-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-semibold text-lg">
                {currency.symbol}
              </span>
              <input
                id="transaction-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Title / Merchant */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              {type === 'expense' ? 'Description / Merchant' : 'Source / Description'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <FileText size={16} />
              </span>
              <input
                id="transaction-title-input"
                type="text"
                placeholder={type === 'expense' ? 'e.g. Trader Joe\'s, Coffee Shop' : 'e.g. Client Payment, Bonus'}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/40">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-white shadow-xs border border-slate-300 font-semibold text-slate-900 ring-1 ring-slate-900/10'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <CategoryIcon category={cat.name} size={14} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Calendar size={16} />
                </span>
                <input
                  id="transaction-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <CreditCard size={16} />
                </span>
                <select
                  id="transaction-payment-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes (Optional)
            </label>
            <input
              id="transaction-notes-input"
              type="text"
              placeholder="Add memo, receipt tag, or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              id="cancel-add-transaction-btn"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-transaction-btn"
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              <span>Record {type === 'expense' ? 'Expense' : 'Income'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
