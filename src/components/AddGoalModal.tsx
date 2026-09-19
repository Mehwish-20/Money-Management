import React, { useState } from 'react';
import { X, PiggyBank, Calendar, DollarSign, Palette } from 'lucide-react';
import { Currency, SavingsGoal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  currency: Currency;
  initialGoal?: SavingsGoal;
}

const COLOR_OPTIONS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  currency,
  initialGoal,
}) => {
  const [name, setName] = useState(initialGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    initialGoal ? initialGoal.targetAmount.toString() : ''
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialGoal ? initialGoal.currentAmount.toString() : '0'
  );
  const [targetDate, setTargetDate] = useState(
    initialGoal?.targetDate ||
      new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(initialGoal?.category || 'General Savings');
  const [color, setColor] = useState(initialGoal?.color || COLOR_OPTIONS[0]);
  const [notes, setNotes] = useState(initialGoal?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      setError('Please provide a goal name (e.g. Emergency Fund, Vacation)');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }
    if (current < 0) {
      setError('Starting amount cannot be negative');
      return;
    }

    onSaveGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate,
      category,
      color,
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
            <span className="p-2 bg-emerald-600 text-white rounded-xl">
              <PiggyBank size={18} />
            </span>
            <h2 className="text-lg font-semibold text-slate-800">
              {initialGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
            </h2>
          </div>
          <button
            id="close-goal-modal-btn"
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
              Goal Name
            </label>
            <input
              id="goal-name-input"
              type="text"
              placeholder="e.g. Dream Trip to Japan, Down Payment, New Car"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                  {currency.symbol}
                </span>
                <input
                  id="goal-target-amount-input"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Current Saved
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
                  {currency.symbol}
                </span>
                <input
                  id="goal-current-amount-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Date
              </label>
              <input
                id="goal-target-date-input"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <select
                id="goal-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Travel & Vacation">Travel & Vacation</option>
                <option value="Home & Real Estate">Home & Real Estate</option>
                <option value="Technology & Gadgets">Technology & Gadgets</option>
                <option value="Vehicle & Transport">Vehicle & Transport</option>
                <option value="Education & Career">Education & Career</option>
                <option value="General Savings">General Savings</option>
              </select>
            </div>
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Theme Color
            </label>
            <div className="flex items-center space-x-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              id="goal-notes-input"
              type="text"
              placeholder="Why this matters, bank account details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              id="cancel-goal-btn"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-goal-btn"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {initialGoal ? 'Update Goal' : 'Create Savings Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
