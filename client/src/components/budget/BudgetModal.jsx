import { useState } from 'react';
import { X, Plus, Edit2, Trash2, Target } from 'lucide-react';
import { EXPENSE_CATEGORIES, formatFullCurrency, MONTHS } from '../../utils/constants';
import { getMonthYear } from '../../utils/constants';

const BudgetModal = ({ isOpen, onClose, onSubmit, editData = null, loading = false }) => {
  const { month, year } = getMonthYear();
  const [form, setForm] = useState(editData || {
    category: '', amount: '', month: month.toString(), year: year.toString()
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: parseFloat(form.amount), month: parseInt(form.month), year: parseInt(form.year) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {editData ? 'Edit Budget' : 'Set Budget'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Month</label>
              <select className="form-input" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <input type="number" className="form-input" value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))} min="2020" max="2030" />
            </div>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className={`form-input ${errors.category ? 'border-red-500' : ''}`}
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="form-label">Budget Amount (₹)</label>
            <input type="number" step="100" min="0" className={`form-input ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="e.g. 5000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : editData ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
