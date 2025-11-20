import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    vendorName: {
      type: String,
      required: [true, 'Please add a vendor name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid',
    },
    notes: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

const Debt = mongoose.model('Debt', debtSchema);

export default Debt;