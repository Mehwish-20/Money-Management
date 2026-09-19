import React, { useState } from 'react';
import { X, CalendarClock, CreditCard, Tag } from 'lucide-react';
import { BillFrequency, Currency, RecurringBill } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultData';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBill: (bill: Omit<RecurringBill, 'id' | 'lastPaidDate'>) => void;
  currency: Currency;
  initialBill?: RecurringBill;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({
  isOpen,
  onClose,
  onSaveBill,
  currency,
  initialBill,
}) => {
  const expenseCategories = DEFAULT_CATEGORIES.filter((c) => c.type === 'expense');

  const [name, setName] = useState(initialBill?.name || '');
  const [amount, setAmount] = useState(initialBill ? initialBill.amount.toString() : '');
  const [category, setCategory] = useState(initialBill?.category || 'Utilities & Bills');
  const [frequency, setFrequency] = useState<BillFrequency>(initialBill?.frequency || 'monthly');
  const [dueDay, setDueDay] = useState(initialBill ? initialBill.dueDay.toString() : '1');
  const [autoPay, setAutoPay] = useState(initialBill?.autoPay ?? true);
  const [notes, setNotes] = useState(initialBill?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const day = parseInt(dueDay, 10);

    if (!name.trim()) {
      setError('Please provide a bill or subscription name');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid bill amount');
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      setError('Due day must be between 1 and 31');
      return;
    }

    onSaveBill({
      name: name.trim(),
      amount: numAmount,
      category,
      frequency,
      dueDay: day,
      autoPay,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-600 text-white rounded-xl">
              <CalendarClock size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-800">
              {initialBill ? 'Edit Recurring Bill' : 'Track Recurring Bill'}
            </h2>
          </div>
          <button
            id="close-bill-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Bill / Subscription Name
            </label>
            <input
              id="bill-name-input"
              type="text"
              placeholder="e.g. Netflix, Electricity, Gym, Rent"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                  {currency.symbol}
                </span>
                <input
                  id="bill-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Billing Cycle
              </label>
              <select
                id="bill-frequency-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <select
                id="bill-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 truncate"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Day of Month (1-31)
              </label>
              <input
                id="bill-dueday-input"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* AutoPay toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Auto-Pay Enabled</span>
              <span className="text-[11px] text-slate-500">Automatically charges your linked account</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="bill-autopay-toggle"
                type="checkbox"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Memo / Notes (Optional)
            </label>
            <input
              id="bill-notes-input"
              type="text"
              placeholder="e.g. Account #, contract renewal date"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              id="cancel-bill-btn"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-bill-btn"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {initialBill ? 'Update Bill' : 'Track Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
