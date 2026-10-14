
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    // First check for the authentication cookie
    let token = req.cookies?.token;

    // If cookie is missing, check the Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token means the customer is not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Verify the JWT using the secret from .env
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the customer associated with this token
    const customer = await Customer.findById(decoded.id)
      .select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Make customer details available to protected controllers
    req.user = customer;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;