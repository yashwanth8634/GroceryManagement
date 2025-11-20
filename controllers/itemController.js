import Item from '../models/itemModel.js';

// ... keep createItem ...
const createItem = async (req, res) => {
  const { name, category, buyPricePerKg, sellPricePerKg } = req.body;
  if (!name || !category || !buyPricePerKg || !sellPricePerKg) throw new Error('Missing fields');
  await Item.create({ name, category, buyPricePerKg, sellPricePerKg, user: req.user._id });
};

// ... keep deleteItem ...
const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item || item.user.toString() !== req.user._id.toString()) throw new Error('Not authorized');
  await item.deleteOne();
};

// ... keep getItems ...
const getItems = async (req, res) => {
    // Use collation to sort case-insensitively if needed, but simple sort is fine
    return await Item.find({ user: req.user._id }).sort({ name: 1 }); // Alphabetical is better for search
};

// NEW: Update Item
const updateItem = async (req, res) => {
    const { name, category, buyPricePerKg, sellPricePerKg } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item || item.user.toString() !== req.user._id.toString()) {
        throw new Error('Item not found or authorized');
    }

    item.name = name || item.name;
    item.category = category || item.category;
    item.buyPricePerKg = buyPricePerKg || item.buyPricePerKg;
    item.sellPricePerKg = sellPricePerKg || item.sellPricePerKg;

    await item.save();
};

// NEW: Get Single Item (for the edit page)
const getItemById = async (id, userId) => {
    const item = await Item.findById(id);
    if (!item || item.user.toString() !== userId.toString()) {
        throw new Error('Item not found');
    }
    return item;
};

export { createItem, deleteItem, getItems, updateItem, getItemById };