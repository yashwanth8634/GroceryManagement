import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
      throw new Error('Please fill all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
      throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id); // This creates the cookie
    // We don't send json, we just return
    return;
  } else {
    throw new Error('Invalid user data');
  }
};

// @desc    Auth user (Login)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password }=req.body;

  if (!email || !password) {
      throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    generateToken(res, user._id); // Create the cookie
    // We don't send json, we just return
    return;
  } else {
    // This error will be caught by index.js and shown on the page
    throw new Error('Invalid email or password');
  }
};

// @desc    Logout user
// @route   GET /logout
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  // No json needed, the redirect is in index.js
};

export { registerUser, loginUser, logoutUser };