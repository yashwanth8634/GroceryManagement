import express from 'express';
import {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/items
router.route('/')
  .get(protect,getItems)
  .post(protect,createItem);

// Routes for /api/items/:id
// The :id part is a URL parameter
router.route('/:id')
  .get(protect,getItemById)
  .put(protect,updateItem)
  .delete(protect,deleteItem);

export default router;