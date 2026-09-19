import React from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  TrendingUp,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { Currency, SavingsGoal } from '../../types';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

interface SavingsGoalsTabProps {
  savingsGoals: SavingsGoal[];
  currency: Currency;
  onOpenAddGoalModal: (initialGoal?: SavingsGoal) => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalsTab: React.FC<SavingsGoalsTabProps> = ({
  savingsGoals,
  currency,
  onOpenAddGoalModal,
  onOpenDepositModal,
  onDeleteGoal,
}) => {
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoalsCount = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Savings Goals</h1>
          <p className="text-xs text-slate-500">
            Set intentional milestones, track progress, and celebrate every financial win
          </p>
        </div>

        <button
          id="open-new-goal-btn"
          onClick={() => onOpenAddGoalModal()}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Saved in Goals
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Overall: {overallPercent.toFixed(1)}% of total {formatCurrency(totalTarget, currency)} target
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Remaining to Save
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalRemaining, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {savingsGoals.length} active targets
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Goals Achieved
          </span>
          <div className="text-2xl font-bold text-indigo-600 mt-1 flex items-center space-x-2">
            <span>{completedGoalsCount} / {savingsGoals.length}</span>
            {completedGoalsCount > 0 && <Award size={22} className="text-amber-500" />}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {completedGoalsCount === savingsGoals.length && savingsGoals.length > 0
              ? 'All current targets completed!'
              : 'Keep up the consistent contributions!'}
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          // Calculate estimated monthly pace needed
          const today = new Date();
          const targetD = new Date(goal.targetDate);
          const diffMonths = Math.max(
            1,
            (targetD.getFullYear() - today.getFullYear()) * 12 +
              (targetD.getMonth() - today.getMonth())
          );
          const monthlyPaceNeeded = remaining / diffMonths;

          return (
            <div
              key={goal.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Goal Top Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {goal.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenAddGoalModal(goal)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Edit goal"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Delete goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug">{goal.name}</h2>
                {goal.notes && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.notes}</p>
                )}

                {/* Amount details */}
                <div className="mt-4 mb-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Saved</span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Target</span>
                    <span className="text-sm font-semibold text-slate-600">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold mt-1.5">
                  <span style={{ color: goal.color }}>{percent}% complete</span>
                  {isCompleted ? (
                    <span className="text-emerald-600 font-bold flex items-center">
                      <Sparkles size={12} className="mr-1" /> Goal Reached!
                    </span>
                  ) : (
                    <span className="text-slate-500 font-normal">
                      {formatCurrency(remaining, currency)} left
                    </span>
                  )}
                </div>

                {/* Target Date & Contribution Pace */}
                {!isCompleted && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Calendar size={12} className="mr-1" /> Target date:
                      </span>
                      <span className="font-medium text-slate-700">{goal.targetDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <TrendingUp size={12} className="mr-1" /> Suggested pace:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(monthlyPaceNeeded, currency)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  id={`deposit-goal-btn-${goal.id}`}
                  onClick={() => onOpenDepositModal(goal)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Plus size={14} />
                  <span>Update Goal Balance (+ Deposit)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
