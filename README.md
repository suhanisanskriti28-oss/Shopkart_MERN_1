# ShopKart — MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built using the MERN stack. It allows users to browse products, manage their shopping cart and wishlist, complete checkout using Razorpay Test Mode, and view their order history.

## Features

- **Customer Authentication:** Register, log in, and log out.
- **Product Browsing:** Browse available products and view product details.
- **Shopping Cart:** Add products, manage quantities, and review cart totals.
- **Wishlist:** Save products for later.
- **Checkout:** Enter shipping details and proceed through the checkout flow.
- **Payment Integration:** Razorpay Test Mode integration with server-side payment verification.
- **Order Management:** Save orders and view order history and payment status.
- **Responsive Interface:** React-based user interface for navigating the application.

## Tech Stack

### Frontend
- React
- JavaScript
- React Router
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT-based authentication
- Cookie-based authentication

### Payment Gateway
- Razorpay Test Mode

## Project Structure

```text
Shopkart_MERN_1/
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

Before running the project, make sure you have:

- Node.js and npm installed.
- A MongoDB local instance or MongoDB Atlas database.
- Razorpay Test Mode API credentials.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/suhanisanskriti28-oss/Shopkart_MERN_1.git
cd Shopkart_MERN_1
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=8089
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the placeholder values with your own credentials. Ensure that your MongoDB database is accessible and that your Razorpay credentials belong to Test Mode.

**Never commit your `.env` file or expose secrets in your source code or public repository.**

Start the backend:

```bash
node index.js
```

The backend is configured to run at:

`http://localhost:8089`

### 3. Configure the Frontend

Open a new terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

Keep both the backend and frontend running while using the application.

## Application Flow

1. Register a customer account or log in.
2. Browse available products.
3. Add products to the cart or wishlist.
4. Review the cart and proceed to checkout.
5. Enter the required shipping information.
6. Complete a payment using Razorpay Test Mode.
7. View the order confirmation and order history.

## Payment Testing

ShopKart integrates Razorpay in **Test Mode**.

- Configure valid Razorpay Test Mode credentials.
- Follow the supported test payment flow.
- Payment verification is performed by the backend.
- Check the order confirmation and payment status in the application.

Test Mode is intended for testing and does not process real payments. Never expose private credentials or use real customer payment details for testing.

## Security Notes

- Keep environment variables and API secrets out of GitHub.
- Use authentication to protect customer-specific endpoints.
- Validate request data and verify payment details on the backend.
- Do not trust client-submitted prices, user IDs, or payment-success claims without server-side validation.

## Future Improvements

- Add automated tests for API endpoints and payment verification.
- Improve inventory updates with atomic database operations.
- Deploy the frontend and backend for public access.
- Enhance monitoring, error handling, and application performance.

## Author

Developed as part of a MERN stack full-stack lab project.
