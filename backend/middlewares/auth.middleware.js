const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => { //ye function humara middleware func jo check kerega
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const customer = await Customer.findById(decoded.id)
      .select('-password');

    if (!customer) {
      return res.status(401).json({
        message: 'Customer not found'
      });
    }

    req.user = customer;

    next();

  } 

  catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

module.exports = protect;