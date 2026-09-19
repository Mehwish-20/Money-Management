import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Currency } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultData';
import { CategoryIcon } from './CategoryIcon';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBudget: (category: string, monthlyLimit: number) => void;
  currency: Currency;
  existingCategories: string[];
  initialCategory?: string;
  initialLimit?: number;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onSaveBudget,
  currency,
  existingCategories,
  initialCategory,
  initialLimit,
}) => {
  const expenseCategories = DEFAULT_CATEGORIES.filter((c) => c.type === 'expense');

  // If editing an existing category or setting a new one
  const [category, setCategory] = useState<string>(
    initialCategory ||
    expenseCategories.find((c) => !existingCategories.includes(c.name))?.name ||
    expenseCategories[0].name
  );
  const [monthlyLimit, setMonthlyLimit] = useState<string>(
    initialLimit ? initialLimit.toString() : ''
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid monthly budget limit above 0');
      return;
    }

    onSaveBudget(category, limit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-600 text-white rounded-xl">
              <Target size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-800">
              {initialCategory ? 'Adjust Budget Limit' : 'Set Category Budget'}
            </h2>
          </div>
          <button
            id="close-budget-modal-btn"
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
              Category
            </label>
            {initialCategory ? (
              <div className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <CategoryIcon category={initialCategory} size={16} />
                <span className="font-semibold text-slate-800 text-sm">{initialCategory}</span>
              </div>
            ) : (
              <select
                id="budget-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {existingCategories.includes(cat.name) ? '(Already set - will update)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Monthly Budget Limit
            </label>
            <div className="relative rounded-xl shadow-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-semibold text-base">
                {currency.symbol}
              </span>
              <input
                id="budget-limit-input"
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 500"
                value={monthlyLimit}
                onChange={(e) => {
                  setMonthlyLimit(e.target.value);
                  setError('');
                }}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Set a realistic monthly spending cap. You'll receive alert indicators when exceeding 75% and 100%.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              id="cancel-budget-btn"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-budget-btn"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
