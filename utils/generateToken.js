import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { userId }, // The data we want to store in the token
    process.env.JWT_SECRET, // Our secret key
    { expiresIn: '30d' } // The token will expire in 30 days
  );

  // We will store the token in an HTTP-Only cookie
  // This is much safer than storing it in localStorage on the frontend
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

export default generateToken;