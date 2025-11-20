import express from 'express';
import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
} from '../controllers/debtController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All these routes are protected
router.use(protect);

// Routes for /api/debts
router.route('/')
  .get(getDebts)
  .post(createDebt);

// Routes for /api/debts/:id
router.route('/:id')
  .put(updateDebt)
  .delete(deleteDebt);

export default router;