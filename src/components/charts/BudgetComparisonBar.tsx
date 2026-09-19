import React from 'react';
import { Budget, Currency } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CategorySpend {
  category: string;
  budgetLimit: number;
  spent: number;
}

interface BudgetComparisonBarProps {
  items: CategorySpend[];
  currency: Currency;
  onEditCategoryBudget?: (category: string) => void;
}

export const BudgetComparisonBar: React.FC<BudgetComparisonBarProps> = ({
  items,
  currency,
  onEditCategoryBudget,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
        No category budgets configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percent = item.budgetLimit > 0 ? (item.spent / item.budgetLimit) * 100 : 0;
        const isOver = percent > 100;
        const isNear = percent >= 80 && percent <= 100;
        const remaining = item.budgetLimit - item.spent;

        let barColor = 'bg-emerald-500';
        let badgeStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200';

        if (isOver) {
          barColor = 'bg-rose-500';
          badgeStyle = 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';
        } else if (isNear) {
          barColor = 'bg-amber-500';
          badgeStyle = 'text-amber-700 bg-amber-50 border-amber-200';
        }

        return (
          <div
            key={item.category}
            className="p-3.5 bg-white border border-slate-100 rounded-xl shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <CategoryIcon category={item.category} size={15} />
                <span className="text-sm font-semibold text-slate-800">{item.category}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
                  {percent.toFixed(0)}%
                </span>
                {onEditCategoryBudget && (
                  <button
                    onClick={() => onEditCategoryBudget(item.category)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-1"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Spent: <strong className="text-slate-700">{formatCurrency(item.spent, currency)}</strong> of{' '}
                {formatCurrency(item.budgetLimit, currency)}
              </span>

              <span>
                {isOver ? (
                  <span className="text-rose-600 font-semibold flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    Over by {formatCurrency(Math.abs(remaining), currency)}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    {formatCurrency(remaining, currency)} remaining
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
