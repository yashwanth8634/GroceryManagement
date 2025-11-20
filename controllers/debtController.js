import Debt from '../models/debtModel.js';

// @desc    Get all debts (Internal use for EJS)
const getDebts = async (userId) => {
  // Sort by: Unpaid first, then by newest date
  return await Debt.find({ user: userId }).sort({ status: -1, createdAt: -1 });
};

// @desc    Create a new debt
const createDebt = async (req, res) => {
  const { vendorName, amount, notes, dueDate } = req.body;

  if (!vendorName || !amount) {
    throw new Error('Vendor name and amount are required');
  }

  await Debt.create({
    vendorName,
    amount,
    notes,
    dueDate,
    user: req.user._id,
    status: 'Unpaid'
  });
};

// @desc    Toggle Paid/Unpaid status
const toggleDebtStatus = async (req, res) => {
  const debt = await Debt.findById(req.params.id);

  if (!debt) throw new Error('Debt not found');
  if (debt.user.toString() !== req.user._id.toString()) throw new Error('Not authorized');

  // Toggle status
  debt.status = debt.status === 'Unpaid' ? 'Paid' : 'Unpaid';
  await debt.save();
};

// @desc    Delete a debt
const deleteDebt = async (req, res) => {
  const debt = await Debt.findById(req.params.id);

  if (!debt) throw new Error('Debt not found');
  if (debt.user.toString() !== req.user._id.toString()) throw new Error('Not authorized');

  await debt.deleteOne();
};

export { getDebts, createDebt, toggleDebtStatus, deleteDebt };