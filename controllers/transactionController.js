import Transaction from '../models/transactionModel.js';

// Save new transaction
const saveTransaction = async (req, res) => {
  const { itemName, weightGrams, price, profit } = req.body;

  if (!itemName || !weightGrams || !price) {
    throw new Error('Missing transaction data');
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    itemName,
    weightGrams,
    price,
    profit
  });

  res.status(201).json(transaction);
};

// Get History
const getHistory = async (userId) => {
  return await Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
};

// NEW: Delete Transaction
const deleteTransaction = async (req, res) => {
    const txn = await Transaction.findById(req.params.id);

    if (!txn) throw new Error('Transaction not found');
    
    // Ensure user owns this transaction
    if (txn.user.toString() !== req.user._id.toString()) {
        throw new Error('Not authorized');
    }

    await txn.deleteOne();
};

export { saveTransaction, getHistory, deleteTransaction };