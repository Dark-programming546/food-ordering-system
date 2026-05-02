# Online Food Ordering System

A full-stack online food ordering platform for local restaurants.

## Features

### Customers

- Register/Login
- Browse restaurants and menus
- Add to cart and checkout
- Make payments
- Track orders in real-time
- View order history

### Restaurants

- Manage restaurant profile
- Add/Edit/Delete menu items
- View incoming orders
- Update order status (Preparing → Ready → Out for Delivery)

### Delivery Personnel

- View assigned orders
- Update delivery status (Picked Up → Delivered)

### Admin

- Manage users (Customers, Restaurants, Delivery)
- View sales reports
- System settings

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Payments**: Stripe

## Project Structure

online-food-ordering/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── models/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── routes/
│ │ ├── services/
│ │ └── utils/
│ ├── .env
│ ├── package.json
│ └── server.js
└── frontend/ (Coming soon)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository

````bash
git clone <your-repo-url>
cd online-food-ordering


---

## Step 4: Create .env.example (Template for others)

Create file: `backend/.env.example`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/food-ordering

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@foodordering.com
ADMIN_PASSWORD=Admin@123456

# Stripe (for payments - add later)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
````
