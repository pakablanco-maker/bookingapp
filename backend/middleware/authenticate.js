import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticate = (req, res, next) => {
  try {
    let token;

    // LOG1: Check what arrives from the client
    console.log("--- Authentication Middleware ---");
    console.log("Headers:", req.headers);
    console.log("Authorization Header:", req.headers.authorization);

    if(req.headers.authorization ){
      token = req.headers.authorization.startsWith('Bearer') ? 
      req.headers.authorization.slice(7)
      : req.headers.authorization;
    }
    else if(req.cookies?.token) {
      token = req.cookies.token;
    }

    // LOG2: Check the token
    console.log("Extracted Token:", token);
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // LOG3: Verify the user
    console.log("Decoded Token:", decoded);
    console.log("User ID from Token:", decoded.id);

    // Store decoded token info on request for use in controllers
    req.user = decoded;
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

export default authenticate;
