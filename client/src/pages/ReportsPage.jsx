import { useState, useEffect } from 'react';
import { Download, FileText, Filter } from 'lucide-react';
import { transactionService, analyticsService } from '../services';
import { formatDate, formatFullCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS, CATEGORY_COLORS } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const now = new Date();
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const params = { startDate, endDate, limit: 500, sortBy: 'date', sortOrder: 'asc' };
      if (reportType === 'income') params.type = 'income';
      if (reportType === 'expense') params.type = 'expense';

      const [txRes, catRes] = await Promise.all([
        transactionService.getAll(params),
        analyticsService.getCategories({ type: reportType === 'income' ? 'income' : 'expense', year, month })
      ]);

      setTransactions(txRes.data.data);
      setCategories(catRes.data.data);

      // Calculate summary
      const txs = txRes.data.data;
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      setSummary({ income, expense, balance: income - expense, count: txs.length });
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateReport(); }, [reportType, month, year]);

  const exportCSV = () => {
    if (!transactions.length) { toast.error('No data to export'); return; }
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
      formatDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount.toFixed(2),
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${MONTHS[month - 1]}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Financial Reports</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Generate and export your financial data</p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Report Controls */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Settings</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="form-label">Report Type</label>
            <select className="form-input" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="monthly">Monthly (All)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
              <option value="category">Category Report</option>
            </select>
          </div>
          <div>
            <label className="form-label">Month</label>
            <select className="form-input" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select className="form-input" value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generateReport} disabled={loading} className="btn-primary w-full">
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: formatFullCurrency(summary.income), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Total Expenses', value: formatFullCurrency(summary.expense), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Net Balance', value: formatFullCurrency(summary.balance), color: summary.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Transactions', value: summary.count, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`card p-4 ${bg}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Chart */}
      {categories.length > 0 && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Category Breakdown — {MONTHS[month - 1]} {year}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} layout="vertical" margin={{ left: 30, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
              <XAxis type="number" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={v => formatFullCurrency(v)} />
              <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                {categories.map(e => (
                  <Cell key={e.category} fill={CATEGORY_COLORS[e.category] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transactions — {MONTHS[month - 1]} {year}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} records</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            No transactions found for this period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Date', 'Description', 'Category', 'Type', 'Payment', 'Amount'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-gray-500 dark:text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="py-2.5 px-3 text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{t.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: (CATEGORY_COLORS[t.category] || '#6b7280') + '20', color: CATEGORY_COLORS[t.category] || '#6b7280' }}>
                        {t.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={t.type === 'income' ? 'badge-income' : 'badge-expense'}>{t.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">{t.paymentMethod}</td>
                    <td className={`py-2.5 px-3 font-semibold text-right ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatFullCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
