import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    itemName: {
      type: String,
      required: true,
    },
    weightGrams: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;