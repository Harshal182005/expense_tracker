import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { analyticsService } from '../services';
import { formatFullCurrency, CATEGORY_COLORS } from '../utils/constants';
import { PageLoader } from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, expCatRes, incCatRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getMonthly(months),
        analyticsService.getCategories({ type: 'expense' }),
        analyticsService.getCategories({ type: 'income' }),
      ]);
      setSummary(sumRes.data.data);
      setMonthlyData(monthRes.data.data);
      setExpenseCategories(expCatRes.data.data);
      setIncomeCategories(incCatRes.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={summary?.totalBalance} type="balance" subtitle="All time" />
        <StatCard title="Savings Rate" value={`${summary?.savingsPercentage}%`} type="savings"
          subtitle="Of total income" isCurrency={false} />
        <StatCard title="Avg Monthly Expense" value={summary?.avgMonthlyExpense} type="expense"
          subtitle="Last 6 months" />
        <StatCard title="Top Category" value={summary?.highestCategory?.name || '-'} type="transactions"
          subtitle={summary?.highestCategory ? formatFullCurrency(summary.highestCategory.amount) : ''}
          isCurrency={false} />
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Show last:</span>
        {[3, 6, 12].map(m => (
          <button key={m} onClick={() => setMonths(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              months === m ? 'bg-blue-600 text-white' : 'btn-secondary'
            }`}>
            {m} months
          </button>
        ))}
      </div>

      {/* Income vs Expense Bar */}
      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Monthly Income vs Expense
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="shortLabel" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={fmt} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings Area Chart */}
      <div className="card p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Monthly Savings Trend
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="shortLabel" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={fmt} />
            <Area type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6"
              strokeWidth={2} fill="url(#savingsGrad)" dot={{ fill: '#8b5cf6', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Expense by Category</h3>
          {expenseCategories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseCategories} dataKey="amount" nameKey="category"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    labelLine={false}>
                    {expenseCategories.map(e => (
                      <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={fmt} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {expenseCategories.map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                        {formatFullCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Income Categories */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Income by Category</h3>
          {incomeCategories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={incomeCategories} dataKey="amount" nameKey="category"
                    cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {incomeCategories.map(e => (
                      <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={fmt} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {incomeCategories.map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#10b981' }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatFullCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Table */}
      {summary && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Income', value: formatFullCurrency(summary.totalIncome), color: 'text-green-600' },
              { label: 'Total Expenses', value: formatFullCurrency(summary.totalExpense), color: 'text-red-600' },
              { label: 'Net Savings', value: formatFullCurrency(summary.totalSavings), color: summary.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600' },
              { label: 'Savings Rate', value: `${summary.savingsPercentage}%`, color: 'text-purple-600' },
              { label: 'Avg Monthly Expense', value: formatFullCurrency(summary.avgMonthlyExpense), color: 'text-orange-600' },
              { label: 'Top Expense Category', value: summary.highestCategory?.name || '-', color: 'text-gray-700 dark:text-gray-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
