# ShopKart — MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack. It allows customers to browse products, manage their cart and wishlist, make test payments, and track their orders.

## Features

- **Customer Authentication:** Register, log in, and log out securely.
- **Product Browsing:** View available products and product details.
- **Shopping Cart:** Add products, manage quantities, and review cart totals.
- **Wishlist:** Save products for later.
- **Checkout:** Proceed through the checkout flow.
- **Payment Integration:** Razorpay Test Mode integration with server-side payment verification.
- **Order Management:** Save orders and view order history and payment status.
- **Responsive Interface:** Navigate the application through a React-based frontend.

## Tech Stack

**Frontend**
- React
- JavaScript
- React Router
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT-based authentication
- Cookie-based authentication

**Payment Gateway**
- Razorpay Test Mode

## Project Structure

```text
Shopkart/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── index.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Make sure you have the following installed:

- Node.js and npm
- MongoDB or a MongoDB Atlas database
- Razorpay Test Mode API credentials

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/suhanisanskriti28-oss/Shopkart_MERN_1.git
cd Shopkart_MERN_1
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory and configure the required environment variables:

```env
PORT=8089
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use your own credentials. Never commit your actual `.env` file or expose API secrets publicly.

Start the backend:

```bash
node index.js
```

The backend runs on `http://localhost:8089`.

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Payment Testing

ShopKart integrates Razorpay in **Test Mode**.

- Use Razorpay's test credentials.
- Complete payments using the supported test flow.
- Payment verification is handled by the backend.
- Orders are saved and their payment status can be viewed in **My Orders**.

Test Mode does not process real payments. Do not publish private credentials or use real customer payment details for testing.

## Application Flow

1. Register or log in.
2. Browse products.
3. Add products to the cart or wishlist.
4. Proceed to checkout.
5. Complete a Razorpay test payment.
6. View the order confirmation and order history.

## Future Improvements

- Persist shipping address details with orders.
- Improve stock updates using atomic database operations.
- Add automated tests for APIs and payment verification.
- Deploy the frontend and backend for public access.

## Author

Developed as part of a MERN stack learning project.
