const jwt = require('jsonwebtoken');

const partnerAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'partner') {
      return res.status(403).json({ message: 'Partner access required' });
    }

    req.partner = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = partnerAuth;