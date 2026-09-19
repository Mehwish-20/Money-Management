import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, SavingsGoal } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DepositGoalModalProps {
  goal: SavingsGoal | null;
  onClose: () => void;
  onUpdateGoalAmount: (goalId: string, newAmount: number, delta: number, action: 'deposit' | 'withdraw') => void;
  currency: Currency;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  goal,
  onClose,
  onUpdateGoalAmount,
  currency,
}) => {
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    if (action === 'withdraw' && val > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance (${formatCurrency(goal.currentAmount, currency)})`);
      return;
    }

    const newTotal = action === 'deposit' ? goal.currentAmount + val : goal.currentAmount - val;

    // Check if goal achieved with this deposit!
    if (action === 'deposit' && newTotal >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error('Confetti trigger error:', err);
      }
    }

    onUpdateGoalAmount(goal.id, newTotal, val, action);
    onClose();
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Update Goal Balance</h2>
            <p className="text-xs text-slate-500 truncate">{goal.name}</p>
          </div>
          <button
            id="close-deposit-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="action-deposit-btn"
              onClick={() => {
                setAction('deposit');
                setError('');
              }}
              className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                action === 'deposit'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={14} className="mr-1 text-emerald-500" />
              Add Savings
            </button>
            <button
              type="button"
              id="action-withdraw-btn"
              onClick={() => {
                setAction('withdraw');
                setError('');
              }}
              className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                action === 'withdraw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={14} className="mr-1 text-slate-500" />
              Withdraw
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Current Saved
            </span>
            <div className="text-xl font-bold text-slate-800">
              {formatCurrency(goal.currentAmount, currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Target: {formatCurrency(goal.targetAmount, currency)} ({Math.round((goal.currentAmount / goal.targetAmount) * 100)}%)
            </div>
          </div>

          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              {action === 'deposit' ? 'Amount to Add' : 'Amount to Withdraw'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold text-lg">
                {currency.symbol}
              </span>
              <input
                id="deposit-amount-input"
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
                className="w-full pl-9 pr-4 py-2.5 text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            {action === 'deposit' && remaining > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">Needed to complete:</span>
                <button
                  type="button"
                  id="fill-remaining-deposit-btn"
                  onClick={() => setAmount(remaining.toFixed(2))}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  +{formatCurrency(remaining, currency)}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              id="cancel-deposit-modal-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-deposit-modal-btn"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 ${
                action === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              <span>Confirm {action === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
