const express = require('express');
const protect = require('../middlewares/auth.middleware');

const {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword
} = require('../controllers/customer.controller');

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutCustomer);
router.patch('/change-password', protect, changePassword);

module.exports = router;