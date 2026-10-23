import { useState, useEffect, useCallback } from 'react';
import { Plus, Download, RefreshCw } from 'lucide-react';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionModal from '../components/transactions/TransactionModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import { transactionService } from '../services';
import { formatDate, formatFullCurrency } from '../utils/constants';
import toast from 'react-hot-toast';

const defaultFilters = {
  search: '', type: '', category: '', paymentMethod: '',
  startDate: '', endDate: '', minAmount: '', maxAmount: '',
  sortBy: 'date', sortOrder: 'desc'
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Clean up empty filter params
      const params = Object.fromEntries(
        Object.entries({ ...filters, page, limit: 20 }).filter(([_, v]) => v !== '')
      );
      const res = await transactionService.getAll(params);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editData) {
        await transactionService.update(editData._id, data);
        toast.success('Transaction updated!');
      } else {
        await transactionService.create(data);
        toast.success('Transaction added!');
      }
      setModalOpen(false);
      setEditData(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await transactionService.delete(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      fetchTransactions();
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  // CSV Export
  const handleExport = () => {
    if (!transactions.length) { toast.error('No transactions to export'); return; }
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
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Transactions</h2>
          {pagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.total} total transactions
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTransactions} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => { setFilters(defaultFilters); setPage(1); }}
      />

      {/* Table */}
      <div className="card p-5">
        <TransactionTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          loading={loading}
        />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
        loading={submitting}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Transaction"
        message="This action cannot be undone. The transaction will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
    </div>
  );
};

export default TransactionsPage;
