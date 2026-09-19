import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Navbar,
} from './components/Navbar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ExpensesTab } from './components/tabs/ExpensesTab';
import { BudgetsTab } from './components/tabs/BudgetsTab';
import { RecurringBillsTab } from './components/tabs/RecurringBillsTab';
import { SavingsGoalsTab } from './components/tabs/SavingsGoalsTab';
import { VisualReportsTab } from './components/tabs/VisualReportsTab';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddBudgetModal } from './components/AddBudgetModal';
import { AddBillModal } from './components/AddBillModal';
import { AddGoalModal } from './components/AddGoalModal';
import { DepositGoalModal } from './components/DepositGoalModal';
import {
  Budget,
  Currency,
  RecurringBill,
  SavingsGoal,
  Transaction,
  TransactionType,
} from './types';
import {
  CURRENCIES,
  getDefaultBudgets,
  getDefaultRecurringBills,
  getDefaultSavingsGoals,
  getDefaultTransactions,
} from './data/defaultData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mm_transactions_v1',
  BUDGETS: 'mm_budgets_v1',
  RECURRING_BILLS: 'mm_recurring_bills_v1',
  SAVINGS_GOALS: 'mm_savings_goals_v1',
  CURRENCY: 'mm_currency_v1',
};

export default function App() {
  // 1. Currency state
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return CURRENCIES[0];
  });

  // 2. Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultTransactions();
  });

  // 3. Budgets
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultBudgets();
  });

  // 4. Recurring Bills
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING_BILLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultRecurringBills();
  });

  // 5. Savings Goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getDefaultSavingsGoals();
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modal states
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [txModalInitialType, setTxModalInitialType] = useState<TransactionType>('expense');
  const [txModalInitialCat, setTxModalInitialCat] = useState<string | undefined>();

  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [budgetToEditCategory, setBudgetToEditCategory] = useState<string | undefined>();
  const [budgetToEditLimit, setBudgetToEditLimit] = useState<number | undefined>();

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<RecurringBill | undefined>();

  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | undefined>();

  const [depositGoalTarget, setDepositGoalTarget] = useState<SavingsGoal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING_BILLS, JSON.stringify(recurringBills));
  }, [recurringBills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  // Handler: Add Transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Save Budget (Upsert)
  const handleSaveBudget = (category: string, monthlyLimit: number) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category.toLowerCase() === category.toLowerCase());
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], monthlyLimit };
        return updated;
      }
      return [
        ...prev,
        {
          id: `b-${Date.now()}`,
          category,
          monthlyLimit,
          month: currentMonth,
        },
      ];
    });
  };

  // Handler: Delete Budget
  const handleDeleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  // Handler: Save Recurring Bill
  const handleSaveBill = (billData: Omit<RecurringBill, 'id' | 'lastPaidDate'>) => {
    if (billToEdit) {
      setRecurringBills((prev) =>
        prev.map((b) =>
          b.id === billToEdit.id ? { ...b, ...billData } : b
        )
      );
    } else {
      const newBill: RecurringBill = {
        ...billData,
        id: `bill-${Date.now()}`,
      };
      setRecurringBills((prev) => [...prev, newBill]);
    }
  };

  // Handler: Mark Bill as Paid
  const handleMarkBillPaid = (billId: string) => {
    const bill = recurringBills.find((b) => b.id === billId);
    if (!bill) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Update bill's lastPaidDate
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, lastPaidDate: todayStr } : b))
    );

    // 2. Automatically record this expense in daily transactions
    handleAddTransaction({
      type: 'expense',
      title: `${bill.name} (Recurring)`,
      amount: bill.amount,
      category: bill.category,
      date: todayStr,
      paymentMethod: bill.autoPay ? 'Bank Transfer' : 'Credit Card',
      notes: `Settled recurring bill on ${todayStr}`,
      recurringBillId: bill.id,
    });
  };

  // Handler: Unmark Bill Paid
  const handleUnmarkBillPaid = (billId: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, lastPaidDate: undefined } : b))
    );
  };

  // Handler: Delete Recurring Bill
  const handleDeleteBill = (billId: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== billId));
  };

  // Handler: Save Savings Goal
  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    if (goalToEdit) {
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalToEdit.id ? { ...g, ...goalData } : g))
      );
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
    }
  };

  // Handler: Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Handler: Update Goal Balance (+ Deposit or - Withdraw)
  const handleUpdateGoalAmount = (
    goalId: string,
    newAmount: number,
    delta: number,
    action: 'deposit' | 'withdraw'
  ) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
    );

    // If depositing, optionally record as an expense or goal allocation
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (goal && action === 'deposit') {
      handleAddTransaction({
        type: 'expense',
        title: `Savings Deposit: ${goal.name}`,
        amount: delta,
        category: 'Personal Care', // or other
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        notes: `Allocated to savings goal "${goal.name}"`,
      });
    }
  };

  // Handler: Reset demo sample data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all financial data back to the default sample preset?')) {
      setTransactions(getDefaultTransactions());
      setBudgets(getDefaultBudgets());
      setRecurringBills(getDefaultRecurringBills());
      setSavingsGoals(getDefaultSavingsGoals());
      setCurrency(CURRENCIES[0]);
    }
  };

  // Calculate current month's totals
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentMonthSpend = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);
  const currentMonthBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAddModal={() => {
          setTxModalInitialType('expense');
          setTxModalInitialCat(undefined);
          setIsAddTxModalOpen(true);
        }}
        monthlySpend={currentMonthSpend}
        monthlyBudget={currentMonthBudget}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            transactions={transactions}
            budgets={budgets}
            recurringBills={recurringBills}
            savingsGoals={savingsGoals}
            currency={currency}
            onNavigateTab={setActiveTab}
            onOpenAddTransaction={() => {
              setTxModalInitialType('expense');
              setTxModalInitialCat(undefined);
              setIsAddTxModalOpen(true);
            }}
            onOpenDepositModal={(goal) => setDepositGoalTarget(goal)}
            onMarkBillPaid={handleMarkBillPaid}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            transactions={transactions}
            currency={currency}
            onAddTransaction={() => {
              setTxModalInitialType('expense');
              setTxModalInitialCat(undefined);
              setIsAddTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onResetData={handleResetDemoData}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsTab
            budgets={budgets}
            transactions={transactions}
            currency={currency}
            onOpenAddBudgetModal={(cat, limit) => {
              setBudgetToEditCategory(cat);
              setBudgetToEditLimit(limit);
              setIsAddBudgetModalOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringBillsTab
            recurringBills={recurringBills}
            currency={currency}
            onOpenAddBillModal={(initialBill) => {
              setBillToEdit(initialBill);
              setIsAddBillModalOpen(true);
            }}
            onMarkBillPaid={handleMarkBillPaid}
            onUnmarkBillPaid={handleUnmarkBillPaid}
            onDeleteBill={handleDeleteBill}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsTab
            savingsGoals={savingsGoals}
            currency={currency}
            onOpenAddGoalModal={(initialGoal) => {
              setGoalToEdit(initialGoal);
              setIsAddGoalModalOpen(true);
            }}
            onOpenDepositModal={(goal) => setDepositGoalTarget(goal)}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'reports' && (
          <VisualReportsTab
            transactions={transactions}
            budgets={budgets}
            currency={currency}
            onOpenBudgetModal={(cat) => {
              setBudgetToEditCategory(cat);
              setBudgetToEditLimit(undefined);
              setIsAddBudgetModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Money Management</span>
            <span>• Daily Expenses, Budgets, Recurring Bills & Savings</span>
          </div>
          <div>
            <span>Local persistence enabled • All data securely stored on your device</span>
          </div>
        </div>
      </footer>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
        initialType={txModalInitialType}
        initialCategory={txModalInitialCat}
      />

      {/* Add / Edit Budget Modal */}
      <AddBudgetModal
        isOpen={isAddBudgetModalOpen}
        onClose={() => {
          setIsAddBudgetModalOpen(false);
          setBudgetToEditCategory(undefined);
          setBudgetToEditLimit(undefined);
        }}
        onSaveBudget={handleSaveBudget}
        currency={currency}
        existingCategories={budgets.map((b) => b.category)}
        initialCategory={budgetToEditCategory}
        initialLimit={budgetToEditLimit}
      />

      {/* Add / Edit Recurring Bill Modal */}
      <AddBillModal
        isOpen={isAddBillModalOpen}
        onClose={() => {
          setIsAddBillModalOpen(false);
          setBillToEdit(undefined);
        }}
        onSaveBill={handleSaveBill}
        currency={currency}
        initialBill={billToEdit}
      />

      {/* Add / Edit Savings Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => {
          setIsAddGoalModalOpen(false);
          setGoalToEdit(undefined);
        }}
        onSaveGoal={handleSaveGoal}
        currency={currency}
        initialGoal={goalToEdit}
      />

      {/* Deposit / Withdraw Goal Modal */}
      <DepositGoalModal
        goal={depositGoalTarget}
        onClose={() => setDepositGoalTarget(null)}
        onUpdateGoalAmount={handleUpdateGoalAmount}
        currency={currency}
      />
    </div>
  );
}
