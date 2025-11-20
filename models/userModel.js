import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique:true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // No two users can have the same email
      lowercase: true,
      unique:true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6, // Enforce a minimum password length
    },
  },
  {
    timestamps: true,
  }
);

// This 'pre' hook runs BEFORE a user is saved
// We use it to hash the password
userSchema.pre('save', async function (next) {
  // Only hash the password if it's being modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10); // Create a 'salt'
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Add a method to the user model to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;