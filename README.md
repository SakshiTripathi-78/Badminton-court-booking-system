# 🏸 Badminton Court Booking & Matchmaking System

A full-stack application for managing badminton court bookings, player matchmaking, and game challenges[cite: 1]. The system uses a **polyglot persistence** backend architecture, leveraging **PostgreSQL** for relational data (users, courts, schedule bookings, and match challenges) and **MongoDB** for flexible, dynamic player skill profiles[cite: 1].

---

## 🌟 Key Features

* 🔐 **Authentication & Security:** User registration and login using `bcrypt` for secure password hashing[cite: 1].
* 🏟️ **Venue & Court Management:** Register venues and map multiple courts per venue[cite: 1].
* 📅 **Smart Booking System:** Real-time scheduling with built-in time-overlap prevention[cite: 1].
* 🤝 **NoSQL Player Matchmaking:** Dynamic player profiles (play style, skill level, preferred hand, favorite brands) stored in MongoDB[cite: 1].
* ⚔️ **Match Challenges & Payments:** Send, accept, and complete mock payments for player-vs-player match challenges[cite: 1].
* 🧵 **Data Stitching Engine:** Merges relational PostgreSQL user details with NoSQL MongoDB profiles into unified API responses[cite: 1].

---

## 🛠️ Tech Stack

### **Backend**
* **Runtime:** Node.js[cite: 1]
* **Framework:** Express.js (v5.x)[cite: 1]
* **Databases:** PostgreSQL (`pg`), MongoDB (`mongodb`)[cite: 1]
* **Security & Utilities:** `bcrypt`, `cors`, `dotenv`[cite: 1]

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
Run the setup script to generate the PostgreSQL tables (`users`, `venues`, `courts`, `bookings`, etc.)[cite: 1]:
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
The server will start at `http://localhost:3000`[cite: 1].

---

## 📡 API Endpoints Overview

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (hashes password with bcrypt)[cite: 1] |
| `POST` | `/auth/login` | Authenticate user & return user payload[cite: 1] |

### 🏟️ Venues & Courts (`/venues`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/venues/venues` | Create a new venue[cite: 1] |
| `POST` | `/venues/addcourt` | Add a court to an existing venue[cite: 1] |
| `GET` | `/venues/venueswithcourt` | Fetch all venues along with their associated courts[cite: 1] |

### 📅 Bookings (`/bookacourt` & Direct Routes)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/bookacourt/bookacourt` | Book a court (includes time-overlap protection)[cite: 1] |
| `POST` | `/book-court` | Book a solo court session[cite: 1] |
| `GET` | `/my-bookings/:userId` | Get solo bookings for a specific user[cite: 1] |

### 🤝 Profile & Matchmaking (MongoDB / Polyglot)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/profile` | Create/update player preferences (upserts to MongoDB)[cite: 1] |
| `POST` | `/matchmaking/matchmakingprofile` | Save dynamic matchmaking profile document[cite: 1] |
| `GET` | `/matchmaking/matchingprofiles` | **Stitching Route:** Combines MongoDB profiles with PostgreSQL user names[cite: 1] |

### ⚔️ Challenges & Payments (`/challenges` & Direct Routes)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/challenges/newmatchchallenge` | Create and issue a match challenge[cite: 1] |
| `GET` | `/challenges/pending/:userId` | Fetch pending match invites for a user[cite: 1] |
| `PUT` | `/challenge/:id/accept` | Accept a challenge invite[cite: 1] |
| `PUT` | `/challenge/:id/pay` | Mock payment processing to reserve court[cite: 1] |
| `GET` | `/matches/:userId` | Fetch accepted and paid matches for a user[cite: 1] |
