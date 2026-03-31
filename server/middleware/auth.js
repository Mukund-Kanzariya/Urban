// Step 4: Authentication Middleware
const jwt = require('jsonwebtoken');

// This function checks if the user has a valid token
const verifyToken = (req, res, next) => {
  // Get token from the headers sent by the React frontend
  const token = req.header('Authorization');

  // If there's no token, they can't access the route
  if (!token) {
    return res.status(401).json({ error: 'Access Denied! Please log in.' });
  }

  try {
    // Check if the token is valid using our secret key
    // The replace command removes 'Bearer ' from the string if it exists
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    
    // Save the verified user data into the request object
    req.user = verified; 
    
    // Move on to the next function (the actual route)
    next(); 
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token!' });
  }
};

module.exports = verifyToken;
