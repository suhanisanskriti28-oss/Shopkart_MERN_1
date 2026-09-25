const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

const customerRoutes = require('./routes/customer.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/customers', customerRoutes);

app.get('/', (req, res) => {
  res.send('ShopKart Backend Running');
});

const PORT = process.env.PORT || 8089;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB Connected');

    app.listen(PORT, () => {
      console.log(`Server Started at ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('DB Connection Failed:', error.message);
  });