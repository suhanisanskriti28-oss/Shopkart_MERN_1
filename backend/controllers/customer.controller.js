const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const existingCustomer = await Customer.findOne({ email });

        if (existingCustomer) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        const customerResponse = customer.toObject();
        delete customerResponse.password;

        res.status(201).json({
            message: 'Customer registered successfully',
            customer: customerResponse
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
};


const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(customer._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        const customerResponse = customer.toObject();
        delete customerResponse.password;

        res.status(200).json({
            message: 'Login successful',
            customer: customerResponse
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
};

const getMe = async (req, res) => {
  res.status(200).json({
    customer: req.user
  });
};

const logoutCustomer = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    message: 'Logout successful'
  });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters'
      });
    }

    const customer = await Customer.findById(req.user._id);

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      customer.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Old password is incorrect'
      });
    }

    customer.password = await bcrypt.hash(newPassword, 10);

    await customer.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword
};