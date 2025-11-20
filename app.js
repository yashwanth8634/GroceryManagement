import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// --- IMPORT CONTROLLERS & MODELS ---
import { protect } from './middleware/authMiddleware.js';
import Transaction from './models/transactionModel.js';
import Item from './models/itemModel.js'; 
import connectDB from './config/db.js';
import { registerUser, loginUser, logoutUser } from './controllers/userController.js';
import { createItem, deleteItem, updateItem, getItemById } from './controllers/itemController.js';
import { getDebts, createDebt, toggleDebtStatus, deleteDebt } from './controllers/debtController.js';
import { saveTransaction, getHistory, deleteTransaction } from './controllers/transactionController.js';


dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- EJS Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---
app.use(cors({ origin: `http://localhost:${port}`, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
//  PAGE ROUTES
// ==========================================

app.get('/', (req, res) => res.render('login', { error: null }));
app.get('/register', (req, res) => res.render('register', { error: null }));

// Dashboard
app.get('/dashboard', protect, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('dashboard', { user: req.user, items: items });
  } catch (error) {
    res.redirect('/'); 
  }
});

// Calculator
app.get('/calculator', protect, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id }).sort({ name: 1 });
    res.render('calculator', { user: req.user, items: items });
  } catch (error) {
    res.redirect('/dashboard');
  }
});

// History
app.get('/history', protect, async (req, res) => {
  try {
    const transactions = await getHistory(req.user._id);
    const totalProfit = transactions.reduce((sum, txn) => sum + txn.profit, 0);
    res.render('history', { user: req.user, transactions, totalProfit });
  } catch (error) {
    res.redirect('/dashboard');
  }
});

// Debt Ledger
app.get('/debts', protect, async (req, res) => {
  try {
    const debts = await getDebts(req.user._id);
    const totalPending = debts.filter(d => d.status === 'Unpaid').reduce((sum, d) => sum + d.amount, 0);
    res.render('debt-ledger', { user: req.user, debts, totalPending });
  } catch (error) {
    res.redirect('/dashboard');
  }
});

// Handle Delete Transaction
app.post('/history/delete/:id', protect, async (req, res) => {
    try {
        await deleteTransaction(req, res);
        res.redirect('/history');
    } catch (error) {
        console.error(error);
        res.redirect('/history');
    }
});

// Forms
app.get('/items/add', protect, (req, res) => res.render('add-item', { user: req.user, error: null }));
app.get('/debts/add', protect, (req, res) => res.render('add-debt', { user: req.user, error: null }));


// ==========================================
//  ACTION ROUTES
// ==========================================

// Users
app.post('/api/users', async (req, res) => {
  try { await registerUser(req, res); res.redirect('/dashboard'); } 
  catch (error) { res.render('register', { error: error.message }); }
});

app.post('/api/users/login', async (req, res) => {
  try { await loginUser(req, res); res.redirect('/dashboard'); } 
  catch (error) { res.render('login', { error: error.message }); }
});

app.get('/logout', (req, res) => { logoutUser(req, res); res.redirect('/'); });

// Items
app.post('/items', protect, async (req, res) => {
  try { await createItem(req, res); res.redirect('/dashboard'); } 
  catch (error) { res.render('add-item', { user: req.user, error: error.message }); }
});
app.post('/items/delete/:id', protect, async (req, res) => { await deleteItem(req, res); res.redirect('/dashboard'); });

// Debts
app.post('/debts', protect, async (req, res) => {
  try { await createDebt(req, res); res.redirect('/debts'); } 
  catch (error) { res.render('add-debt', { user: req.user, error: error.message }); }
});
app.post('/debts/toggle/:id', protect, async (req, res) => { await toggleDebtStatus(req, res); res.redirect('/debts'); });
app.post('/debts/delete/:id', protect, async (req, res) => { await deleteDebt(req, res); res.redirect('/debts'); });

// Transactions (AJAX)
app.post('/api/transactions', protect, async (req, res) => {
    try {
        await saveTransaction(req, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


app.get('/items/edit/:id', protect, async (req, res) => {
    try {
        const item = await getItemById(req.params.id, req.user._id);
        res.render('edit-item', { user: req.user, item: item, error: null });
    } catch (error) {
        res.redirect('/dashboard');
    }
});

// Handle Update Item
app.post('/items/update/:id', protect, async (req, res) => {
    try {
        await updateItem(req, res);
        res.redirect('/dashboard');
    } catch (error) {
        // If error, we need to fetch the item again to show the form
        try {
            const item = await getItemById(req.params.id, req.user._id);
            res.render('edit-item', { user: req.user, item: item, error: error.message });
        } catch (e) {
            res.redirect('/dashboard');
        }
    }
});

// Show Settings
app.get('/settings', protect, (req, res) => {
  res.render('settings', { user: req.user });
});

app.get('/api/export/inventory', protect, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id });

    // Create CSV Header
    let csv = 'Name,Category,Buy Price,Sell Price,Created At\n';

    // Add Rows
    items.forEach(item => {
      csv += `"${item.name}","${item.category}",${item.buyPricePerKg},${item.sellPricePerKg},"${item.createdAt}"\n`;
    });

    // Send file
    res.header('Content-Type', 'text/csv');
    res.attachment('inventory.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.redirect('/settings');
  }
});

// Export Sales History to CSV
app.get('/api/export/history', protect, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    let csv = 'Item Name,Weight (g),Price,Profit,Date,Time\n';

    txns.forEach(txn => {
      const date = new Date(txn.createdAt).toLocaleDateString();
      const time = new Date(txn.createdAt).toLocaleTimeString();
      csv += `"${txn.itemName}",${txn.weightGrams},${txn.price},${txn.profit},"${date}","${time}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('sales_history.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.redirect('/settings');
  }
});

app.listen(port, () => {
  console.log(`EJS server running on http://localhost:${port}`);
});