import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Target } from 'lucide-react';
import { budgetService } from '../services';
import BudgetModal from '../components/budget/BudgetModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatFullCurrency, MONTHS, getMonthYear, CATEGORY_COLORS } from '../utils/constants';
import { PageLoader } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const BudgetsPage = () => {
  const { month: currentMonth, year: currentYear } = getMonthYear();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getAll({ month, year });
      setBudgets(res.data.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editData) {
        await budgetService.update(editData._id, data);
        toast.success('Budget updated!');
      } else {
        await budgetService.create(data);
        toast.success('Budget created!');
      }
      setModalOpen(false);
      setEditData(null);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await budgetService.delete(deleteId);
      toast.success('Budget deleted');
      setDeleteId(null);
      fetchBudgets();
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Budget Management</h2>
        <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Set Budget
        </button>
      </div>

      {/* Month/Year selector */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">View budget for:</span>
        <select className="form-input w-36" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-input w-28" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatFullCurrency(totalBudget)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{formatFullCurrency(totalSpent)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className={`text-xl font-bold mt-1 ${totalBudget - totalSpent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatFullCurrency(totalBudget - totalSpent)}
            </p>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No budgets set</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">
            Set category budgets to track your spending
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Set Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const color = CATEGORY_COLORS[budget.category] || '#3b82f6';
            const isExceeded = budget.status === 'exceeded';
            const isWarning = budget.status === 'warning';
            const barColor = isExceeded ? '#ef4444' : isWarning ? '#f59e0b' : color;

            return (
              <div key={budget._id} className={`card p-5 border-l-4 transition-transform hover:scale-[1.01] ${
                isExceeded ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{budget.category}</h4>
                    </div>
                    {(isExceeded || isWarning) && (
                      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {isExceeded ? 'Budget exceeded!' : '80% reached'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditData(budget); setModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(budget._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatFullCurrency(budget.spent)} spent
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      of {formatFullCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, budget.percentage)}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {budget.percentage}% used
                  </span>
                  <span className={`font-medium ${budget.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {budget.remaining > 0 ? `₹${budget.remaining.toLocaleString('en-IN')} left` : 'Over budget!'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        loading={submitting}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Budget"
        message="This budget will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default BudgetsPage;
