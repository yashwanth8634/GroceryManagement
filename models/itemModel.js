import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links it to the 'User' model
    },

    name: {
      type: String,
      required: [true, 'Please add an item name'],
      trim: true, // Removes whitespace
      unique:true,
      
    },
    buyPricePerKg: {
      type: Number,
      required: [true, 'Please add a purchase price per kg'],
      min: [0, 'Price cannot be negative'],
    },
    sellPricePerKg: {
      type: Number,
      required: [true, 'Please add a selling price per kg'],
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    // This adds 'createdAt' and 'updatedAt' fields automatically
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);

export default Item;