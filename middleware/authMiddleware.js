import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  const token=req.cookies.jwt;

  if (token) {
    try {
      // 2. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get the user from the token's ID
      // and attach it to the request object ('req')
      req.user = await User.findById(decoded.userId).select('-password');

      // 4. Call the next function in the chain
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };