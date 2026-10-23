import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/common/StatCard';
import TransactionModal from '../components/transactions/TransactionModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { analyticsService, transactionService } from '../services';
import { formatDate, formatFullCurrency, CATEGORY_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, monthlyRes, catRes, txRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getMonthly(6),
        analyticsService.getCategories({ type: 'expense' }),
        transactionService.getAll({ limit: 8, sortBy: 'date', sortOrder: 'desc' })
      ]);
      setSummary(summaryRes.data.data);
      setMonthlyData(monthlyRes.data.data);
      setCategoryData(catRes.data.data);
      setRecentTransactions(txRes.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddTransaction = async (data) => {
    setSubmitting(true);
    try {
      await transactionService.create(data);
      toast.success('Transaction added!');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTooltipValue = (value) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={summary?.totalBalance} type="balance"
          subtitle="All time net" loading={loading} />
        <StatCard title="Total Income" value={summary?.totalIncome} type="income"
          subtitle="All time earnings" loading={loading} />
        <StatCard title="Total Expenses" value={summary?.totalExpense} type="expense"
          subtitle="All time spending" loading={loading} />
        <StatCard title="Total Transactions" value={summary?.totalTransactions} type="transactions"
          subtitle="All transactions" loading={loading} isCurrency={false} />
      </div>

      {/* Current Month Summary */}
      {!loading && summary && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            This Month Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatFullCurrency(summary.monthIncome)}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatFullCurrency(summary.monthExpense)}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">Savings</p>
              <p className={`text-xl font-bold mt-1 ${summary.monthBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatFullCurrency(summary.monthBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Income vs Expense (6 months)
          </h3>
          {loading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Expense by Category
          </h3>
          {loading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No expense data yet
            </div>
          ) : (
            <div className="flex gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatFullCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-52">
                {categoryData.slice(0, 7).map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.category}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Savings Trend */}
      {!loading && monthlyData.length > 0 && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Savings Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="shortLabel" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatTooltipValue} />
              <Line type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <ArrowLeftRight className="w-8 h-8 mx-auto mb-2" />
            <p>No transactions yet. <button onClick={() => setModalOpen(true)} className="text-blue-600 dark:text-blue-400 hover:underline">Add one!</button></p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map(t => (
              <div key={t._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {t.type === 'income'
                    ? <TrendingUp className="w-4 h-4 text-green-600" />
                    : <TrendingDown className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.category} · {formatDate(t.date)}</p>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ${
                  t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatFullCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
        loading={submitting}
      />
    </div>
  );
};

export default DashboardPage;
