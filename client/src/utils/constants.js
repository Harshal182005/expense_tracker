export const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transport', 'Bills', 'Entertainment',
  'Health', 'Education', 'Rent', 'Travel', 'Other'
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Other'
];

export const PAYMENT_METHODS = [
  'Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'
];

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Shopping: '#8b5cf6',
  Transport: '#3b82f6',
  Bills: '#ef4444',
  Entertainment: '#ec4899',
  Health: '#10b981',
  Education: '#06b6d4',
  Rent: '#f97316',
  Travel: '#84cc16',
  Other: '#6b7280',
  Salary: '#10b981',
  Freelance: '#3b82f6',
  Business: '#8b5cf6',
  Investment: '#f59e0b',
};

export const formatCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0;
  if (num >= 100000) return `${currency}${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${currency}${(num / 1000).toFixed(1)}K`;
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatFullCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0;
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const getMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
