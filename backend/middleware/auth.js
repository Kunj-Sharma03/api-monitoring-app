const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const formattedToken = token.startsWith('Bearer ')
      ? token.split(' ')[1]
      : token;

    if (typeof formattedToken !== 'string') {
      throw new Error('Invalid token format');
    }

    req.user = jwt.verify(formattedToken, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
