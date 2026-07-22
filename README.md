# 🏸 Badminton Court Booking & Matchmaking System

A full-stack application for managing badminton court bookings, player matchmaking, and game challenges. The system uses a **polyglot persistence** backend architecture, leveraging **PostgreSQL** for relational data (users, courts, schedule bookings, and match challenges) and **MongoDB** for flexible, dynamic player skill profiles.

---

## 🌟 Key Features

* 🔐 **Authentication & Security:** User registration and login using `bcrypt` for secure password hashing.
* 🏟️ **Venue & Court Management:** Register venues and map multiple courts per venue.
* 📅 **Smart Booking System:** Real-time scheduling with built-in time-overlap prevention.
* 🤝 **NoSQL Player Matchmaking:** Dynamic player profiles (play style, skill level, preferred hand, favorite brands) stored in MongoDB.
* ⚔️ **Match Challenges & Payments:** Send, accept, and complete mock payments for player-vs-player match challenges.
* 🧵 **Data Stitching Engine:** Merges relational PostgreSQL user details with NoSQL MongoDB profiles into unified API responses.

---

## 🛠️ Tech Stack

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js (v5.x)
* **Databases:** PostgreSQL (`pg`), MongoDB (`mongodb`)
* **Security & Utilities:** `bcrypt`, `cors`, `dotenv`

### **Frontend**
* **Framework:** React + Vite
* **Styling:** CSS3

---

## 📁 Directory Structure

```text
court-booking-api/
├── court-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL Pool connection settings
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register & login authentication logic
│   │   │   ├── bookingControllers.js # Relational booking & collision checks
│   │   │   ├── challengeControllers.js# Challenge issuance and pending lists
│   │   │   ├── matchControllers.js   # MongoDB profile & stitching handlers
│   │   │   └── venueController.js    # Venues & court administration
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── challengeRoutes.js
│   │   │   ├── matchRoutes.js
│   │   │   └── venueRoutes.js
│   │   └── index.js                  # Main Express app entry point
│   ├── .env                          # Local environment variables
│   ├── package.json
│   ├── reset-db.js                   # Script to wipe tables and reset serial IDs
│   ├── setup-tables.js               # Initial relational schema setup script
│   └── update-db.js                  # Database migrations script
├── court-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── InfoBlock.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── PlayerAvatar.jsx
│   │   │   └── SoloBookingView.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of `court-backend` directory with the following variables[cite: 1]:

```env
PORT=3000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=court_booking_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
MONGO_URI=mongodb://localhost:27017
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd court-backend
npm install
```

### 2. Initialize Database Tables
Run the setup script to generate the PostgreSQL tables (`users`, `venues`, `courts`, `bookings`, etc.):
```bash
node setup-tables.js
```

> **Note:** To clear all rows and reset primary key counters back to 1, run:
> ```bash
> node reset-db.js
> ```

### 3. Start the Backend Server
```bash
node src/index.js
```
The server will start at `http://localhost:3000`

---

## 📡 API Endpoints Overview

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (hashes password with bcrypt) |
| `POST` | `/auth/login` | Authenticate user & return user payload |

### 🏟️ Venues & Courts (`/venues`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/venues/venues` | Create a new venue |
| `POST` | `/venues/addcourt` | Add a court to an existing venue |
| `GET` | `/venues/venueswithcourt` | Fetch all venues along with their associated courts |

### 📅 Bookings (`/bookacourt` & Direct Routes)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/bookacourt/bookacourt` | Book a court (includes time-overlap protection)|
| `POST` | `/book-court` | Book a solo court session |
| `GET` | `/my-bookings/:userId` | Get solo bookings for a specific user |

### 🤝 Profile & Matchmaking (MongoDB / Polyglot)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/profile` | Create/update player preferences (upserts to MongoDB)|
| `POST` | `/matchmaking/matchmakingprofile` | Save dynamic matchmaking profile document |
| `GET` | `/matchmaking/matchingprofiles` | **Stitching Route:** Combines MongoDB profiles with PostgreSQL user names |

### ⚔️ Challenges & Payments (`/challenges` & Direct Routes)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/challenges/newmatchchallenge` | Create and issue a match challenge|
| `GET` | `/challenges/pending/:userId` | Fetch pending match invites for a user |
| `PUT` | `/challenge/:id/accept` | Accept a challenge invite |
| `PUT` | `/challenge/:id/pay` | Mock payment processing to reserve court |
| `GET` | `/matches/:userId` | Fetch accepted and paid matches for a user|
