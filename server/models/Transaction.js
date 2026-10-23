const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transport', 'Bills', 'Entertainment',
  'Health', 'Education', 'Rent', 'Travel', 'Other'
];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
    default: 'Cash'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
