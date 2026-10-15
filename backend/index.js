const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require("./routes/order.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());



app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://shopkart-mern-1.vercel.app'
  ],
  credentials: true
}));


app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use("/orders", orderRoutes);




app.get('/', (req, res) => {
  res.send('ShopKart Backend Running');
});

const PORT = process.env.PORT || 8089;

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB Connected');
  })
  .catch((error) => {
    console.log('DB Connection Failed:', error.message);
  });