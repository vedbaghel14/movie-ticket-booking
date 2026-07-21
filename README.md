# 🎬 Movie Ticket Booking System

A full-stack web application designed to simplify the movie ticket booking experience. Users can browse upcoming and currently playing movies, select showtimes, view dynamic seating layouts, and reserve seats in real time.

---

## ✨ Features

- **User Authentication:** Secure registration and login.
- **Movie Catalog:** View current and upcoming movies with descriptions, ratings, genres, and durations.
- **Showtime & Theater Selection:** Filter movies by date, theater location, and available time slots.
- **Interactive Seat Selection:** Real-time seat availability visualization (Available, Selected, Reserved).
- **Booking & Ticket Management:** Summary of selected seats, total pricing, and ticket confirmation.
- **User Dashboard:** View booking history and active tickets.
- **Admin Panel:** Manage movies, add/edit showtimes, and configure theater seat layouts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework/Library:** React / HTML5 & CSS3
- **Styling:** Tailwind CSS / Bootstrap
- **State Management:** Context API / Redux

### Backend
- **Server:** Node.js (Express)
- **Database:** MongoDB / PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)

---

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Git](https://git-scm.com/)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/vedbaghel14/movie-ticket-booking.git](https://github.com/vedbaghel14/movie-ticket-booking.git)
   cd movie-ticket-booking
   Install backend dependencies:

Bash
cd backend
npm install
Install frontend dependencies:

Bash
cd ../frontend
npm install
⚙️ Environment Variables
Create a .env file in the backend root directory and configure the following variables:

Code snippet
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
🏃 Running the Application
Start the Backend Server:

Bash
cd backend
npm start
The server will start running on http://localhost:5000.

Start the Frontend Application:

Bash
cd frontend
npm start
The frontend client will start running on http://localhost:3000.

🗄️ Database Schema Overview
Users: _id, name, email, password, role

Movies: _id, title, genre, duration, posterUrl, description

Theaters/Screens: _id, name, location, totalSeats, seatLayout

Showtimes: _id, movieId, theaterId, startTime, ticketPrice

Bookings: _id, userId, showtimeId, seatsBooked, totalAmount, status

🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git checkout -b feature/AmazingFeature)

Open a Pull Request
